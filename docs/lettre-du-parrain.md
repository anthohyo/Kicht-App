# La lettre du Parrain

Newsletter mensuelle de KichtApp. Tout est prêt dans l'app, **mais désactivé** tant que
`NEWSLETTER_URL` est vide dans `src/legal.ts` : aucun bouton n'apparaît, et la politique de
confidentialité continue d'affirmer, à juste titre, qu'aucune adresse e-mail n'est demandée.

---

## 1. Mise en service

À faire dans cet ordre. Tant que l'étape 5 n'est pas faite, rien ne change pour les utilisateurs.

1. **Créer un compte Brevo** (prestataire français).
2. **Créer un formulaire d'inscription hébergé par Brevo**, avec :
   - la **double confirmation** activée (preuve du consentement) ;
   - une case de consentement **non cochée** : « J'accepte de recevoir la lettre du Parrain,
     une fois par mois. Je peux me désinscrire à tout moment. » ;
   - un lien vers `https://kicht-app.anthony-bayard69.workers.dev/confidentialite.html`.
3. **Désactiver le suivi des ouvertures** dans Brevo. Depuis sa recommandation d'avril 2026,
   la CNIL exige un consentement spécifique pour les pixels qui mesurent l'ouverture des
   emails ([CNIL](https://www.cnil.fr/fr/recommandation-pixel-suivi-courriels)). On mesure
   les clics, plus fiables de toute façon : Apple Mail fausse les ouvertures.
4. **Récupérer l'adresse publique du formulaire** — du type `https://…sibforms.com/…`.
   **Jamais la clé d'API** : un test refuse tout ce qui y ressemble.
5. **La coller dans `src/legal.ts`** :
   ```ts
   export const NEWSLETTER_URL = 'https://…';
   ```
   Le bouton apparaît sous les aides, et l'écran Confidentialité change automatiquement.
6. **Mettre à jour la page publique** `public/confidentialite.html` — elle est statique et
   ne suit pas l'interrupteur. Ajouter la section de la partie 3 ci-dessous.
7. **Mettre à jour la fiche App Store** (`docs/app-store.md`, sections 9 et 10) — voir la
   partie 4.
8. **Ajouter l'entrée au registre** (partie 2), puis redéployer.

---

## 2. Registre des traitements

| Rubrique | Contenu |
|---|---|
| Traitement | Envoi de la lettre d'information « La lettre du Parrain » |
| Responsable | Anthony Bayard — anthony.bayard69@gmail.com |
| Finalité | Informer les abonnés des changements d'aides et de démarches, une fois par mois |
| Base légale | Consentement (article 6.1.a du RGPD), recueilli avec double confirmation |
| Données | Adresse e-mail uniquement. Aucune donnée saisie dans l'app n'y est associée |
| Personnes concernées | Abonnés volontaires, à partir de 16 ans |
| Destinataires | L'éditeur ; Brevo, en qualité de sous-traitant |
| Transferts hors UE | Aucun prévu — prestataire établi en France |
| Durée de conservation | Jusqu'à la désinscription, puis suppression |
| Mesures | Pas de suivi des ouvertures ; désinscription dans chaque envoi ; aucun lien avec les données de l'app |

---

## 3. Texte à ajouter aux pages de confidentialité

Pour `public/confidentialite.html`, reprendre à l'identique ce que l'app affiche une fois la
lettre activée :

> **La lettre du Parrain**
>
> La lettre est facultative. Si tu t'y abonnes, ton adresse e-mail est recueillie sur une page
> hébergée par Brevo, prestataire français, uniquement pour t'envoyer la lettre, une fois par mois.
>
> Elle n'est jamais reliée à ce que tu saisis dans l'app : l'app ne voit pas ton adresse, et la
> lettre ne sait rien de ta situation. Aucune mesure d'ouverture n'est faite. Chaque envoi contient
> un lien de désinscription, et ton adresse est supprimée dès que tu l'utilises.

Et remplacer « aucune adresse e-mail demandée » par : « Aucune adresse e-mail demandée dans
l'app — seulement si tu t'abonnes à la lettre, sur une page à part. »

---

## 4. Fiche App Store

Dans l'étiquette de confidentialité, « Data Not Collected » ne sera plus exact. Déclarer :

| Type | Donnée | Liée à l'identité | Utilisée pour le pistage | Finalité |
|---|---|---|---|---|
| Coordonnées | Adresse e-mail | Oui | Non | Publicité ou marketing du développeur |

Tout le reste reste « non collecté ». L'inscription se fait sur une page extérieure, mais le
bouton est dans l'app : mieux vaut le déclarer que de le laisser découvrir.

Ajouter aux notes de revue : « L'app propose de s'abonner à une lettre mensuelle facultative.
L'inscription se fait sur un formulaire hébergé par Brevo, ouvert dans Safari ; l'app ne collecte
pas l'adresse elle-même. »

---

## 5. Premier numéro — octobre 2026

Chaque information est sourcée. **Relire les sources le jour de l'envoi** : les deux premières
dépendent de décisions qui peuvent encore bouger.

> **Objet : Ce qui change pour ton APL ce mois-ci**
>
> Salut,
>
> Première lettre du Parrain. Trois choses, cinq minutes.
>
> **🏠 Ce qui change : ton APL augmente**
>
> Les aides au logement doivent être revalorisées de **1,15 %** au 1er octobre 2026, au rythme de
> l'indice de référence des loyers. Rien à faire : la CAF l'applique toute seule — à condition
> que ta situation soit à jour sur ton espace.
> *Source : service-public.gouv.fr, 11 septembre 2026, « sauf décision contraire du gouvernement ».*
>
> **💶 L'aide du mois : la prime d'activité**
>
> Tu as un job ou tu es en alternance ? Regarde la prime d'activité. Depuis avril 2026, elle a
> été revalorisée de 0,8 % et renforcée pour les revenus proches du SMIC. Pour un étudiant ou un
> apprenti, il faut gagner au moins environ 1 144 € par mois.
>
> Et la moitié des foyers qui y ont droit ne la demandent pas.
> *Sources : CAF, 2026 ; DREES, Études et Résultats n° 1379, juillet 2026.*
>
> **✅ La démarche du mois**
>
> Si tu touches déjà la prime d'activité, n'oublie pas ta **déclaration trimestrielle de
> ressources** sur caf.fr : sans elle, le versement s'arrête.
>
> Simule tes aides dans KichtApp → kicht-app.anthony-bayard69.workers.dev
>
> Le Parrain
>
> *Tu reçois cette lettre parce que tu t'y es abonné. [Se désinscrire]*

---

## 6. Calendrier éditorial

Seules les deux premières lignes sont vérifiées. Les autres dates bougent d'une année sur
l'autre : **les vérifier sur la source officielle avant chaque envoi**.

| Mois | Sujet | Statut |
|---|---|---|
| Octobre | Revalorisation de l'APL au 1er octobre | ✅ vérifié (service-public) |
| Avril | Revalorisation de la prime d'activité au 1er avril | ✅ vérifié (CAF) |
| Janvier – mai | Dossier de bourse CROUS pour la rentrée suivante | ⚠️ dates à vérifier |
| Avril – juin | Déclaration de revenus | ⚠️ dates à vérifier |
| Juillet – septembre | Chercher un logement : Visale avant les visites, APL le mois de l'emménagement | ✅ règles vérifiées |
| Chaque mois | L'aide du mois, tirée des 31 aides vérifiées | ✅ sources dans l'app |
