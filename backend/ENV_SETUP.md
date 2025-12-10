# Configuration des Variables d'Environnement

Créez un fichier `.env` dans le dossier `backend/` avec les variables suivantes :

## Variables Requises

```env
# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017/greenloop

# Configuration JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Configuration Twilio pour SMS
# Obtenez ces informations sur https://www.twilio.com/console
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Configuration Frontend
FRONTEND_URL=http://localhost:3000

# Configuration Serveur
PORT=5000
NODE_ENV=development
```

## Configuration Twilio

Pour activer l'envoi réel de SMS :

1. Créez un compte sur [Twilio](https://www.twilio.com/)
2. Obtenez votre `Account SID` et `Auth Token` depuis la console Twilio
3. Achetez un numéro de téléphone Twilio (ou utilisez un numéro d'essai)
4. Ajoutez ces valeurs dans votre fichier `.env`

## Mode Développement

Si Twilio n'est pas configuré, le système fonctionnera en mode développement :
- Les SMS seront simulés dans la console
- Le code de vérification sera renvoyé dans la réponse API (uniquement en développement)
- Cela permet de tester sans coût SMS

## Sécurité

⚠️ **IMPORTANT** : Ne commitez jamais le fichier `.env` dans Git !
- Le fichier `.env` doit être dans `.gitignore`
- Utilisez des secrets différents en production
- Changez `JWT_SECRET` pour un secret fort et unique

