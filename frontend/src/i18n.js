import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      common: {
        dashboard: 'Tableau de bord',
        seed: 'Ma Graine',
        messages: 'Messages',
        favorites: 'Favoris',
        announcements: 'Annonces',
        map: 'Carte',
        videos: 'Vidéos',
        marketplace: 'Marketplace',
        profile: 'Profil',
        logout: 'Déconnexion',
        notifications: 'Notifications'
      }
    }
  },
  dar: {
    translation: {
      common: {
        dashboard: 'Tableau de bord',
        seed: 'El Gra3a',
        messages: 'Messages',
        favorites: 'Favoris',
        announcements: 'El i3lanet',
        map: 'El kharita',
        videos: 'Vidéo',
        marketplace: 'Souk',
        profile: 'Profil',
        logout: 'Tsajel khroj',
        notifications: 'Tbibate'
      },
      landing: {
        welcome: 'Marhba bik',
        heroTitle: 'Badel el foued en ressources',
        heroCta: 'Bda taw',
        heroSub: 'GreenLoop yjame3 ben deposants w collecteurs w recycleurs fi Tounes.'
      },
      auth: {
        login: 'Dkhoul',
        signup: 'E3mel compte',
        phonePlaceholder: '+216 XX XXX XXX',
        sendCode: 'B3ath el code',
        back: 'Raj3',
        phoneRequired: 'A3tini numrouk',
        sendError: 'Saret mouchkla fil envoi',
        enterPhone: 'A3tini numrouk bech yjike code',
        phone: 'Numrou ettel',
        phoneFormat: 'Format: +216 12 345 678',
        sending: 'Nab3ath...',
        terms: 'En continuant, t2ebbel bil chourout',
        noAccount: 'Ma3andekch compte ? E3mel compte fi 2 minutes !'
      }
    }
  }
};

const savedLang = localStorage.getItem('gl_lang') || 'fr';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

