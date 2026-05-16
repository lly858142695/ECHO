import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { BrowserWindow, globalShortcut } from 'electron';
import { IpcChannels } from '../../shared/constants/ipcChannels';
import {
  globalShortcutActions,
  isMouseButtonAccelerator,
  validateGlobalShortcutAccelerator,
  type GlobalShortcutBinding,
  type GlobalShortcutAction,
  type GlobalShortcutValidationResult,
} from '../../shared/types/globalShortcuts';
import type { AppSettings } from '../../shared/types/appSettings';
import { getAppSettings, setAppSettings } from './appSettings';
import { getMainWindow } from './windowManager';

type RegistrationStatus = {
  action: GlobalShortcutAction;
  accelerator: string | null;
  enabled: boolean;
  registered: boolean;
  error: string | null;
};

let initialized = false;
const registeredAccelerators = new Map<GlobalShortcutAction, string>();
const registeredMouseAccelerators = new Map<string, GlobalShortcutAction>();
let mouseHookProcess: ChildProcessWithoutNullStreams | null = null;
let lastRegistrationStatuses: RegistrationStatus[] = [];

const windowsMouseHookScript = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public static class EchoMouseShortcutHook
{
    private const int WH_MOUSE_LL = 14;
    private const int WM_XBUTTONDOWN = 0x020B;
    private const int WM_QUIT = 0x0012;
    private static LowLevelMouseProc _proc = HookCallback;
    private static IntPtr _hookID = IntPtr.Zero;

    private delegate IntPtr LowLevelMouseProc(int nCode, IntPtr wParam, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    private struct POINT
    {
        public int x;
        public int y;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct MSLLHOOKSTRUCT
    {
        public POINT pt;
        public uint mouseData;
        public uint flags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct MSG
    {
        public IntPtr hwnd;
        public uint message;
        public UIntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public POINT pt;
    }

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelMouseProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll")]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern sbyte GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    private static extern bool TranslateMessage([In] ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern IntPtr DispatchMessage([In] ref MSG lpMsg);

    public static void Run()
    {
        _hookID = SetWindowsHookEx(WH_MOUSE_LL, _proc, IntPtr.Zero, 0);
        if (_hookID == IntPtr.Zero)
        {
            Console.Error.WriteLine("hook-failed");
            Environment.Exit(2);
            return;
        }

        Console.WriteLine("ready");
        Console.Out.Flush();

        MSG msg;
        while (GetMessage(out msg, IntPtr.Zero, 0, 0) != 0)
        {
            if (msg.message == WM_QUIT)
            {
                break;
            }
            TranslateMessage(ref msg);
            DispatchMessage(ref msg);
        }

        UnhookWindowsHookEx(_hookID);
    }

    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
    {
        if (nCode >= 0 && wParam == (IntPtr)WM_XBUTTONDOWN)
        {
            MSLLHOOKSTRUCT hookStruct = (MSLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(MSLLHOOKSTRUCT));
            int xButton = (int)((hookStruct.mouseData >> 16) & 0xffff);
            if (xButton == 1)
            {
                Console.WriteLine("MouseButton4");
                Console.Out.Flush();
            }
            else if (xButton == 2)
            {
                Console.WriteLine("MouseButton5");
                Console.Out.Flush();
            }
        }

        return CallNextHookEx(_hookID, nCode, wParam, lParam);
    }
}
"@
[EchoMouseShortcutHook]::Run()
`;

const createStatus = (
  action: GlobalShortcutAction,
  binding: GlobalShortcutBinding | undefined,
  patch: Partial<RegistrationStatus> = {},
): RegistrationStatus => ({
  action,
  accelerator: binding?.accelerator ?? null,
  enabled: binding?.enabled === true,
  registered: false,
  error: null,
  ...patch,
});

const unregisterManagedShortcuts = (): void => {
  for (const accelerator of registeredAccelerators.values()) {
    globalShortcut.unregister(accelerator);
  }

  registeredAccelerators.clear();
  registeredMouseAccelerators.clear();
};

const stopMouseShortcutHook = (): void => {
  if (!mouseHookProcess) {
    return;
  }

  mouseHookProcess.kill();
  mouseHookProcess = null;
};

const dispatchMouseShortcutLine = (line: string): void => {
  const action = registeredMouseAccelerators.get(line.trim());
  if (action) {
    dispatchGlobalShortcutCommand(action);
  }
};

const ensureMouseShortcutHook = (): boolean => {
  if (process.platform !== 'win32') {
    return false;
  }

  if (mouseHookProcess && !mouseHookProcess.killed) {
    return true;
  }

  const encodedScript = Buffer.from(windowsMouseHookScript, 'utf16le').toString('base64');
  const nextProcess = spawn('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    'Bypass',
    '-EncodedCommand',
    encodedScript,
  ], { windowsHide: true });
  mouseHookProcess = nextProcess;

  let pending = '';
  nextProcess.stdout.setEncoding('utf8');
  nextProcess.stdout.on('data', (chunk: string) => {
    pending += chunk;
    const lines = pending.split(/\r?\n/u);
    pending = lines.pop() ?? '';
    for (const line of lines) {
      dispatchMouseShortcutLine(line);
    }
  });
  nextProcess.once('exit', () => {
    if (mouseHookProcess === nextProcess) {
      mouseHookProcess = null;
    }
  });
  nextProcess.once('error', () => {
    if (mouseHookProcess === nextProcess) {
      mouseHookProcess = null;
    }
  });

  return true;
};

const getCommandWindow = (): BrowserWindow | null => getMainWindow() ?? BrowserWindow.getAllWindows()[0] ?? null;

const showMainWindow = (): void => {
  const window = getCommandWindow();
  if (!window || window.isDestroyed()) {
    return;
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.show();
  window.focus();
};

const hideMainWindow = (): void => {
  const window = getCommandWindow();
  if (!window || window.isDestroyed()) {
    return;
  }

  window.hide();
};

const dispatchGlobalShortcutCommand = (action: GlobalShortcutAction): void => {
  if (action === 'showMainWindow') {
    showMainWindow();
    return;
  }

  const window = getCommandWindow();
  if (!window || window.isDestroyed()) {
    return;
  }

  window.webContents.send(IpcChannels.AppGlobalShortcutCommand, action);
  if (action === 'bossKey') {
    hideMainWindow();
  }
};

const registerActionShortcut = (
  action: GlobalShortcutAction,
  accelerator: string,
  binding: GlobalShortcutBinding,
): RegistrationStatus => {
  if (isMouseButtonAccelerator(accelerator)) {
    if (!ensureMouseShortcutHook()) {
      return createStatus(action, binding, {
        registered: false,
        error: 'unavailable',
      });
    }

    registeredMouseAccelerators.set(accelerator, action);
    return createStatus(action, binding, { registered: true });
  }

  let registered = false;
  try {
    registered = globalShortcut.register(accelerator, () => dispatchGlobalShortcutCommand(action));
  } catch {
    registered = false;
  }

  if (!registered) {
    return createStatus(action, binding, {
      registered: false,
      error: 'unavailable',
    });
  }

  registeredAccelerators.set(action, accelerator);
  return createStatus(action, binding, { registered: true });
};

const disableUnavailableShortcuts = (settings: AppSettings, failedActions: GlobalShortcutAction[]): AppSettings => {
  if (failedActions.length === 0 || !settings.globalShortcuts) {
    return settings;
  }

  const nextShortcuts = { ...settings.globalShortcuts };
  for (const action of failedActions) {
    nextShortcuts[action] = {
      ...nextShortcuts[action],
      enabled: false,
    };
  }

  return setAppSettings({ globalShortcuts: nextShortcuts });
};

export const refreshBackgroundSpaceRegistration = (): AppSettings | null => {
  unregisterManagedShortcuts();
  stopMouseShortcutHook();

  const settings = getAppSettings();
  const statuses: RegistrationStatus[] = [];
  const failedActions: GlobalShortcutAction[] = [];

  for (const action of globalShortcutActions) {
    const binding = settings.globalShortcuts?.[action];
    if (!binding?.enabled || !binding.accelerator) {
      statuses.push(createStatus(action, binding));
      continue;
    }

    const validation = validateGlobalShortcutAccelerator(binding.accelerator);
    if (!validation.valid || !validation.accelerator) {
      statuses.push(createStatus(action, binding, { error: validation.reason }));
      failedActions.push(action);
      continue;
    }

    const status = registerActionShortcut(action, validation.accelerator, binding);
    statuses.push(status);
    if (!status.registered) {
      failedActions.push(action);
    }
  }

  lastRegistrationStatuses = statuses;

  if (failedActions.length === 0) {
    return null;
  }

  const nextSettings = disableUnavailableShortcuts(settings, failedActions);
  unregisterManagedShortcuts();
  stopMouseShortcutHook();

  for (const action of globalShortcutActions) {
    const binding = nextSettings.globalShortcuts?.[action];
    if (binding?.enabled && binding.accelerator) {
      const validation = validateGlobalShortcutAccelerator(binding.accelerator);
      if (validation.valid && validation.accelerator) {
        const status = registerActionShortcut(action, validation.accelerator, binding);
        const statusIndex = lastRegistrationStatuses.findIndex((item) => item.action === action);
        if (statusIndex >= 0) {
          lastRegistrationStatuses[statusIndex] = status;
        }
      }
    }
  }

  return nextSettings;
};

export const initializeBackgroundPlaybackShortcuts = (): void => {
  if (initialized) {
    return;
  }

  initialized = true;
  refreshBackgroundSpaceRegistration();
};

export const bindBackgroundPlaybackShortcutsToWindow = (): void => {
  if (initialized) {
    refreshBackgroundSpaceRegistration();
  }
};

export const disposeBackgroundPlaybackShortcuts = (): void => {
  unregisterManagedShortcuts();
  stopMouseShortcutHook();
  lastRegistrationStatuses = [];
};

export const validateGlobalShortcut = (accelerator: unknown): GlobalShortcutValidationResult => {
  const validation = validateGlobalShortcutAccelerator(accelerator);
  if (!validation.valid || !validation.accelerator) {
    return validation;
  }

  if (globalShortcut.isRegistered(validation.accelerator)) {
    return validation;
  }

  if (isMouseButtonAccelerator(validation.accelerator)) {
    return process.platform === 'win32'
      ? validation
      : {
          ...validation,
          available: false,
          reason: 'unavailable',
        };
  }

  let available = false;
  try {
    available = globalShortcut.register(validation.accelerator, () => undefined);
  } catch {
    available = false;
  }

  if (available) {
    globalShortcut.unregister(validation.accelerator);
    return validation;
  }

  return {
    ...validation,
    available: false,
    reason: 'unavailable',
  };
};

export const getGlobalShortcutRegistrationStatuses = (): RegistrationStatus[] => lastRegistrationStatuses;
