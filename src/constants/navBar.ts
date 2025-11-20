export const navBar: NavBarItem[] = [
  {
    name: "Activity",
    link: "/",
  },
 
  // {
  //   name: "Favourites",
  //   link: "/favourites",
  // },
];

interface NavBarItem {
  name: string;
  link: string;
}

let isRegistered = true;

export function setIsRegistered(value: boolean) {
  isRegistered = value;
}

export function getIsRegistered() {
  return isRegistered;
}
