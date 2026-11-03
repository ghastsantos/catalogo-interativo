import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseLibrary } from '../domain/library';
import type { AppUser, LibrarySnapshot } from '../types/models';

const keyFor = (user: AppUser) => `@entre-episodios/library/v1/${user.provider}/${user.id}`;
export const readLibrary = async (user: AppUser) => parseLibrary(await AsyncStorage.getItem(keyFor(user)));
export const writeLibrary = (user: AppUser, state: LibrarySnapshot) => AsyncStorage.setItem(keyFor(user), JSON.stringify(state));
