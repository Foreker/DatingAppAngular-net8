export interface User {
    username: string;
    knownAs: string;
    token: string;
    photoUrl?: string; // Optional property for the user's photo URL
}