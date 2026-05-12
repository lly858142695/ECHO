import { registerAppLifecycle } from './app/lifecycle';
import { registerIpc } from './ipc/registerIpc';
import { registerCoverProtocolScheme } from './protocol/coverProtocol';

registerCoverProtocolScheme();
registerIpc();
registerAppLifecycle();
