import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS } from '../../constants/collections';

export const reportService = createFirestoreService(COLLECTIONS.REPORTS);
export const settingService = createFirestoreService(COLLECTIONS.SETTINGS);

export default {
  reportService,
  settingService,
};
