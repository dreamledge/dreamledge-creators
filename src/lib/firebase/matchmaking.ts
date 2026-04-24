import type { DocumentData } from "firebase/firestore";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "./index";

const WAITING_QUEUE_COLLECTION = "waitingQueue";

export async function joinWaitingQueue(userId: string): Promise<string | null> {
  console.log('joinWaitingQueue called for user:', userId);
  console.log('firestore available:', !!firestore);
  
  if (!firestore) {
    console.error('Firestore is not available!');
    return null;
  }
  
  try {
    // First check if anyone is already waiting
    console.log('Checking waiting queue...');
    const q = collection(firestore, WAITING_QUEUE_COLLECTION);
    const snapshot = await getDocs(q);
    console.log('Waiting queue snapshot size:', snapshot.size);
    
    // Look for the first user that's not us
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data() as DocumentData;
      console.log('Found user in queue:', data.userId);
      if (data.userId !== userId) {
        const opponentId = data.userId as string;
        
        // Remove the waiting user from queue
        await deleteDoc(docSnapshot.ref);
        console.log('Removed waiting user from queue');
        
        // Return the opponent ID to indicate match found
        return opponentId;
      }
    }
    
    // No one waiting, add current user to queue
    console.log('No one waiting, adding user to queue');
    await addDoc(collection(firestore, WAITING_QUEUE_COLLECTION), {
      userId,
      joinedAt: serverTimestamp(),
    });
    console.log('Added user to waiting queue');
    
    return null; // null means added to queue, not matched
  } catch (error) {
    console.error("Error joining queue:", error);
    return null;
  }
}

export async function leaveWaitingQueue(): Promise<void> {
  if (!firestore) return;
  
  try {
    // Remove all entries (in case of duplicates)
    const q = collection(firestore, WAITING_QUEUE_COLLECTION);
    const snapshot = await getDocs(q);
    
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(docSnapshot.ref);
    }
  } catch (error) {
    console.error("Error leaving queue:", error);
  }
}

export function startMatchmaking(
  userId: string,
  onOpponentFound: (opponentId: string) => void,
  timeoutMs: number = 30000
): () => void {
  if (!firestore) {
    // Return a cleanup function that does nothing
    return () => {};
  }
  
  // Set up the subscription
  const unsubscribe = subscribeWaitingQueue(
    userId,
    onOpponentFound,
    () => {}, // We'll handle timeout in the returned cleanup function
    timeoutMs
  );
  
  // Return a cleanup function
  return () => {
    unsubscribe();
  };
}

export function subscribeWaitingQueue(
  userId: string,
  onOpponentFound: (opponentId: string) => void,
  onTimeout: () => void,
  timeoutMs: number = 30000
): () => void {
  if (!firestore) {
    setTimeout(onTimeout, timeoutMs);
    return () => {};
  }
  
  const q = collection(firestore, WAITING_QUEUE_COLLECTION);
  
  let timedOut = false;
  
  const unsubscribe = onSnapshot(q, async (snapshot) => {
    if (timedOut) return;
    
    // Check if there's anyone else in queue besides us
    let opponentId: string | null = null;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data() as DocumentData;
      if (data.userId !== userId) {
        opponentId = data.userId as string;
        break;
      }
    }
    
    if (opponentId) {
      timedOut = true;
      unsubscribe();
      
      // Remove ourselves from the queue and match with the opponent
      try {
        // First, remove our own entry from queue
        const ourQuery = query(q, where("userId", "==", userId));
        const ourSnapshot = await getDocs(ourQuery);
        for (const docSnapshot of ourSnapshot.docs) {
          await deleteDoc(docSnapshot.ref);
        }
        
        // Now remove the opponent's entry
        const opponentQuery = query(q, where("userId", "==", opponentId));
        const opponentSnapshot = await getDocs(opponentQuery);
        for (const docSnapshot of opponentSnapshot.docs) {
          await deleteDoc(docSnapshot.ref);
        }
        
        // Notify that we found a match
        onOpponentFound(opponentId);
      } catch (error) {
        console.error("Error in matchmaking process:", error);
        onTimeout();
      }
    }
  });
  
  const timeoutId = setTimeout(() => {
    if (!timedOut) {
      timedOut = true;
      unsubscribe();
      onTimeout();
    }
  }, timeoutMs);
  
  return () => {
    clearTimeout(timeoutId);
    if (!timedOut) {
      unsubscribe();
    }
  };
}