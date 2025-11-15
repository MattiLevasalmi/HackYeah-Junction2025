export interface User {
  userId: string;
  name: string;
  imagePath: string;
}

export const users: User[] = [
  { userId: "f449d263-a4cd-45e7-a1ac-bc38f3600ec8", name: "Alice", imagePath: 'images/users/Alice.svg' },
  { userId: "296765fb-9210-4bcc-8585-691df07c5ffa", name: "Bob", imagePath: 'images/users/Bob.svg' },
  { userId: "4203b09e-35b7-4882-92d3-257c33bc45ee", name: "Joe", imagePath: 'images/users/Joe.svg' }
];
