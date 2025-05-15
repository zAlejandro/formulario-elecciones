import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay()), provideFirebaseApp(() => initializeApp({ projectId: "eleccio-9585f", appId: "1:552240548674:web:b9745b127d45d7617296db", storageBucket: "eleccio-9585f.firebasestorage.app", apiKey: "AIzaSyDRY_XSojsfz8iFU0AjqHK7_AhxtDTyzSM", authDomain: "eleccio-9585f.firebaseapp.com", messagingSenderId: "552240548674" })), provideFirestore(() => getFirestore()), provideFirebaseApp(() => initializeApp({ projectId: "eleccio-9585f", appId: "1:552240548674:web:b9745b127d45d7617296db", storageBucket: "eleccio-9585f.firebasestorage.app", apiKey: "AIzaSyDRY_XSojsfz8iFU0AjqHK7_AhxtDTyzSM", authDomain: "eleccio-9585f.firebaseapp.com", messagingSenderId: "552240548674" })), provideAuth(() => getAuth())]
};
