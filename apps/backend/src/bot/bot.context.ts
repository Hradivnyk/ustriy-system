import type { Scenes } from 'telegraf';

export interface RegistrationState {
  residentType?: 'student' | 'tenant';
  name?: string;
  dormitoryId?: number;
  roomFloor?: number;
  roomNum?: number;
  roomNumber?: string;
  email?: string;
  userId?: string;
}

export interface AccountRecoveryState {
  userId?: string;
}

export interface SubmitTicketState {
  specialistId?: number;
  specialistName?: string;
  description?: string;
}

export interface TicketPaginationState {
  ticketIndex?: number;
}

export interface ProfileEditState {
  editField?: 'name' | 'dormitory' | 'room';
  roomFloor?: number;
  roomNum?: number;
}

export interface BotSession extends Scenes.WizardSessionData {
  pendingUserId?: string;
}

export type BotContext = Scenes.WizardContext & {
  session: BotSession;
  wizard: Scenes.WizardContext['wizard'] & {
    state: RegistrationState &
      SubmitTicketState &
      TicketPaginationState &
      ProfileEditState;
  };
};
