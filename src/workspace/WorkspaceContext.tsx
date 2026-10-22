import { createContext, useContext } from 'react';
import type { Role, WarrantyRecord } from '../types';

export interface WorkspaceValue {
  records: WarrantyRecord[];
  role: Role;
  canEdit: boolean;
  reload(): Promise<boolean>;
  openEditor(r: WarrantyRecord | null): void;
}

export const WorkspaceCtx = createContext<WorkspaceValue | null>(null);

export const useWorkspace = (): WorkspaceValue => {
  const v = useContext(WorkspaceCtx);
  if (!v) throw new Error('useWorkspace phải nằm trong Workspace');
  return v;
};
