# Fiche App Store Connect — KichtApp

Tout ce qui suit est prêt à copier-coller. Rédigé le 29 septembre 2026.

## Ce qui est vérifié, et ce qui ne l'est pas

**Vérifié sur une page officielle Apple** ([App Store Connect Help — App information](https://developer.apple.com/help/app-store-connect/reference/app-information)) :
le nom fait entre 2 et 30 caractères, le sous-titre 30 au maximum.

**Vérifié également** ([Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications)) :
les tailles de captures et leur nombre (voir plus bas).

**Non confirmé sur une page officielle** : les limites des mots-clés (100), du texte
promotionnel (170) et de la description (4 000). Ces valeurs sont stables depuis des
années et App Store Connect affiche un compteur qui refuse le dépassement — vérifie-le
au moment de la saisie. Les textes ci-dessous sont dimensionnés pour passer largement.

---

## 1. Nom de l'app

| Proposition | Caractères | Limite |
|---|---|---|
| `KichtApp` | 8 | 30 ✅ |
| `KichtApp : aides et démarches` | 29 | 30 ✅ |
| `KichtApp — tes aides de jeune` | 29 | 30 ✅ |

**Recommandation : `KichtApp`.** Le nom seul, court, mémorisable. Les mots-clés se
placent dans le champ prévu pour ça, pas dans le nom — Apple déclasse les noms bourrés
de termes de recherche.

## 2. Sous-titre

| Proposition | Caractères | Limite |
|---|---|---|
| `Les aides que tu rates` | 22 | 30 ✅ |
| `APL, bourse, budget, démarches` | 30 | 30 ✅ |
| `Tes droits quand tu pars seul` | 29 | 30 ✅ |

**Recommandation : `Les aides que tu rates`.** C'est la promesse réelle de l'app, dans
les mots de l'utilisateur, et ça complète le nom sans le répéter.

## 3. Mots-clés

```
apl,caf,bourse,crous,étudiant,aides,logement,visale,budget,jeune,alternant,démarches,loyer
```

**90 caractères** sur 100. Séparés par des virgules sans espace : un espace
consomme un caractère pour rien.

Ne répète ni le nom de l'app ni la catégorie — Apple les indexe déjà.

## 4. Texte promotionnel

```
Quatre questions, et tu sais quelles aides te concernent : APL, bourse, transport, caution. Gratuit, sans compte, et tes données restent sur ton téléphone.
```

**155 caractères** sur 170. Ce champ se modifie sans passer par une revue : il
sert à annoncer une nouveauté ou une échéance (« La déclaration de revenus ouvre en
avril »).

## 5. Description

**2119 caractères** sur 4 000.

```
KichtApp réunit au même endroit les aides auxquelles tu as droit et les démarches à faire quand tu quittes le domicile familial.

Réponds à quatre questions — ton prénom, ton âge, ton logement, tes revenus — et l'app te dit ce qui te concerne, toi.

CE QUE TU TROUVES DEDANS

• Tes aides estimées : APL, bourse CROUS, complémentaire santé solidaire, garantie Visale, avance Loca-Pass, prime d'activité, et d'autres selon ta situation. Avec un ordre de grandeur et la marche à suivre, étape par étape.

• Les aides de ta ville : abonnement de transport à tarif jeune, restauration universitaire, fonds d'aide aux jeunes de ton département. Chaque montant affiché porte sa source officielle et la date à laquelle il a été vérifié. Une aide qui n'a pas pu être vérifiée n'est pas affichée.

• Tes démarches dans l'ordre, sans jargon : ce qu'il faut faire maintenant, et ce qui peut attendre.

• Un budget simple : ce qui rentre, ce qui sort, ce qu'il te reste pour finir le mois.

• Un agenda qui te prévient avant tes échéances, directement depuis ton téléphone.

• Des modèles de courriers prêts à compléter, et des fiches pratiques pour comprendre un bail, une fiche de paie ou une déclaration de revenus.

• Le Parrain, qui répond à tes questions courantes sur l'argent, le logement et l'administration.

DES ESTIMATIONS, PAS DES DROITS ACQUIS

Les montants affichés sont calculés à partir des barèmes publics. Seul l'organisme concerné décide de ce que tu touches vraiment. KichtApp est indépendante : elle n'a aucun lien avec la CAF, le CROUS, Action Logement, une mairie ou une région.

TES DONNÉES RESTENT SUR TON TÉLÉPHONE

Pas de compte, pas d'inscription, pas de serveur, pas de publicité, aucun traceur. Ce que tu saisis — ta situation, tes revenus, ton loyer — reste sur cet appareil. Tu peux tout effacer en un geste, ou en faire une sauvegarde pour changer de téléphone.

GRATUIT, ENTIÈREMENT

Aucun abonnement, aucun achat intégré, aucune option payante. Le produit s'adresse à des jeunes dont il calcule qu'il leur reste parfois moins que rien à la fin du mois : leur faire payer serait une contradiction.
```

## 6. Nouveautés de cette version

```
Première version.

KichtApp rassemble les aides et les démarches pour les jeunes qui quittent le domicile familial : simulateur d'aides nationales et locales, budget mensuel, agenda avec rappels, modèles de courriers et fiches pratiques.

Toutes les communes de France sont reconnues, et chaque aide locale affiche sa source officielle avec sa date de vérification.
```

## 7. Catégories

| Champ | Valeur | Pourquoi |
|---|---|---|
| Principale | **Finance** | Le cœur de l'app estime des montants et suit un budget. C'est là que cherchent les gens qui veulent savoir ce à quoi ils ont droit. |
| Secondaire | **Éducation** | Les fiches pratiques et le quiz expliquent l'impôt, le bail, la fiche de paie. |

Alternative défendable : Style de vie en secondaire, si tu constates que Éducation te
place face à des apps scolaires sans rapport.

## 8. Classification par âge

Le questionnaire d'Apple a changé en 2025 : les notes vont désormais de 4+ à 18+.
Réponds à ce que l'écran affiche ; voici ce qui s'applique à KichtApp.

| Question | Réponse | Justification |
|---|---|---|
| Violence, contenu sexuel, nudité, langage grossier | Aucun | L'app ne contient rien de tel. |
| Jeux d'argent, loterie, concours | Aucun | Rien de tel non plus. |
| Alcool, tabac, drogues | Aucun | — |
| Thèmes sensibles / médicaux | Aucun | L'app parle d'aides sociales, pas de santé. |
| Accès web illimité (navigateur intégré) | **Non** | Les liens externes s'ouvrent dans Safari, pas dans une vue web embarquée. |
| Contenu créé par les utilisateurs, partage entre utilisateurs | **Non** | Rien n'est publié ni partagé : l'app n'a pas de serveur. |
| Fonctionnalités de discussion | **À déclarer** | Le Parrain répond hors ligne par défaut ; s'il est activé avec une clé personnelle, les réponses viennent d'un modèle d'IA. Voir la section 10. |

**Note attendue : 4+.** Si le questionnaire propose une case spécifique aux assistants
conversationnels, coche-la et explique dans les notes de revue que la fonction est
inactive tant que l'utilisateur ne fournit pas sa propre clé.

## 9. Confidentialité de l'app (étiquettes)

| Type de données | Réponse | Pourquoi |
|---|---|---|
| Coordonnées (nom, e-mail, téléphone) | **Non collecté** | Aucun compte, aucune inscription. Le prénom saisi ne quitte pas l'appareil. |
| Données financières | **Non collecté** | Revenus et loyer sont stockés localement, jamais transmis. |
| Localisation | **Non collecté** | La ville est saisie au clavier ; aucune API de géolocalisation n'est utilisée. |
| Identifiants, historique de navigation, données d'usage | **Non collecté** | Aucun analytics, aucun traceur — une seule requête réseau existe dans tout le code. |
| Diagnostics | **Non collecté** | Aucun rapport de plantage n'est envoyé. |

**Réponse globale : « Data Not Collected ».**

**Le cas de l'assistant IA doit être expliqué**, pas caché : si l'utilisateur colle sa
propre clé API Anthropic, ses questions partent vers Anthropic, sous son compte à lui.
L'éditeur ne collecte rien et n'a accès à rien. Décris-le dans les notes de revue
(section 10). Si Apple demande malgré tout une déclaration, la catégorie honnête est
« Contenu utilisateur — non lié à l'identité, non utilisé pour le suivi ».

## 10. Notes pour l'équipe de revue

À coller dans « App Review Information » → « Notes ». C'est ce qui évite un refus par
malentendu.

```
Bonjour,

Quelques précisions pour faciliter la revue :

1. Aucun compte n'est nécessaire. L'app s'utilise immédiatement : quatre questions
   d'introduction, puis tout est accessible. Aucun identifiant de test n'est requis.

2. L'app est entièrement gratuite. Aucun achat intégré, aucun abonnement, aucune
   publicité.

3. Aucune donnée n'est collectée. Tout ce que l'utilisateur saisit reste sur
   l'appareil (stockage local). L'application ne dispose d'aucun serveur.

4. L'assistant « Le Parrain » fonctionne HORS LIGNE par défaut : ses réponses sont
   écrites à l'avance dans l'application. Il ne devient un assistant IA que si
   l'utilisateur colle sa propre clé API Anthropic dans son profil — sous son propre
   compte, à ses propres frais. Cette fonction est donc inactive lors de la revue, et
   l'app est pleinement fonctionnelle sans elle.

5. Les montants affichés sont des estimations calculées à partir des barèmes publics
   français. L'application indique clairement qu'elle n'est affiliée à aucune
   administration et que seul l'organisme concerné décide des droits réels.

6. Politique de confidentialité : https://kicht-app.anthony-bayard69.workers.dev/confidentialite.html
   Mentions légales : https://kicht-app.anthony-bayard69.workers.dev/mentions-legales.html

Merci de votre lecture.
```

## 11. URLs à renseigner

| Champ | Valeur |
|---|---|
| Privacy Policy URL | `https://kicht-app.anthony-bayard69.workers.dev/confidentialite.html` |
| Support URL | `https://kicht-app.anthony-bayard69.workers.dev/mentions-legales.html` |
| Marketing URL (facultatif) | `https://kicht-app.anthony-bayard69.workers.dev` |

L'URL d'assistance est obligatoire. La page des mentions légales fait l'affaire :
elle porte l'adresse de contact et le bouton de signalement.

## 12. Captures d'écran

Source : [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications).

- **Minimum 1, maximum 10** par taille d'écran.
- Il faut fournir **soit le 6,9 pouces, soit le 6,5 pouces**. Sans captures 6,9″, celles
  du 6,5″ sont mises à l'échelle automatiquement.
- Tailles acceptées en portrait : 6,9″ → 1320 × 2868, 1290 × 2796 ou 1260 × 2736 px.
  6,5″ → 1284 × 2778 ou 1242 × 2688 px.
- Formats `.png`, `.jpg`, `.jpeg`. **Aucune transparence, aucun canal alpha** — une
  capture avec alpha est refusée au dépôt.

**Comment les obtenir sans Xcode sur ce Mac :** installe l'app sur ton iPhone via
TestFlight, fais tes captures avec le téléphone (bouton latéral + volume haut), puis
dépose-les. Un iPhone récent produit directement la bonne définition.

Cinq écrans à montrer, dans cet ordre : le résultat des aides avec un montant, les
aides de la ville avec leur date de vérification, le budget du mois, l'agenda avec un
rappel, l'écran de confidentialité.

## 13. Chiffrement (export compliance)

**Réponse : non.** L'app n'utilise que HTTPS standard. C'est déjà déclaré dans
`app.json` (`ios.config.usesNonExemptEncryption: false`), donc App Store Connect ne
reposera pas la question à chaque envoi de build.

## 14. Récapitulatif des champs

| Champ | Valeur à saisir | État |
|---|---|---|
| Nom | KichtApp | ✅ prêt |
| Sous-titre | Les aides que tu rates | ✅ prêt |
| Mots-clés | voir section 3 | ✅ prêt |
| Texte promotionnel | voir section 4 | ✅ prêt |
| Description | voir section 5 | ✅ prêt |
| Nouveautés | voir section 6 | ✅ prêt |
| Catégories | Finance / Éducation | ✅ prêt |
| Classification par âge | 4+ attendu | ⚠️ questionnaire à remplir |
| Confidentialité | Data Not Collected | ✅ prêt |
| Notes de revue | voir section 10 | ✅ prêt |
| Privacy Policy URL | confidentialite.html | ✅ en ligne |
| Support URL | mentions-legales.html | ✅ en ligne |
| Captures d'écran | 5 écrans | ❌ à produire depuis un iPhone |
| Chiffrement | non | ✅ déjà dans app.json |
| Compte développeur | 99 $/an | ❌ à ouvrir |
