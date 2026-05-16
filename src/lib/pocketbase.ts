import PocketBase from 'pocketbase';
export const pb = new PocketBase('/pb');
pb.autoCancellation(false);
