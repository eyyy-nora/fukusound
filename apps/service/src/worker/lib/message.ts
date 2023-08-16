export interface WorkerMessage {
  type: WorkerEvent;
  method?: string;
  id?: string;
  params?: any[];
  stage?: string;
  progress?: number;
  error?: any;
  result?: any;
}

export enum WorkerEvent {
  Init = "worker:init",
  Call = "worker:call",
  Progress = "worker:call:progress",
  Report = "worker:call:report",
  Error = "worker:call:error",
  Exit = "worker:exit",
}

export function isWorkerMessage(
  msg: any,
  ...types: WorkerEvent[]
): msg is WorkerMessage {
  if (!msg || typeof msg !== "object") return false;
  return "type" in msg && types.includes(msg.type);
}
