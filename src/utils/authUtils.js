import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const isAdmin = async (user) => {
  if (!user) return false;

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    return userDoc.exists() && userDoc.data().role === 'admin';
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
};
