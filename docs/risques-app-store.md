# Motifs de refus App Store — audit de KichtApp

Audit réalisé le 29 septembre 2026 contre les
[App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
Chaque point a été vérifié dans le code, pas supposé. Les intitulés de sections ont été
confirmés sur la page officielle le jour de l'audit.

---

## Ce qui a déjà été corrigé

**Fonctionnalité factice — guideline 2.1 « App Completeness »**
Toucher la photo de profil affichait « Fonctionnalité disponible prochainement ». C'est
l'un des motifs de refus les plus courants, et c'était visible dès l'écran profil.
L'avatar n'est plus cliquable là où la fonction n'existe pas, et un test automatique
refuse désormais toute promesse de ce genre dans les écrans.

**Métadonnées et captures iPad**
`supportsTablet` était à `true` : Apple aurait exigé des captures iPad et jugé le rendu
sur cette taille d'écran, alors que l'interface est pensée pour un téléphone. Passé à
`false`.

**Politique de confidentialité inaccessible**
App Store Connect exige une URL publique. Tout vivait derrière une application monopage.
Deux pages statiques sont désormais en ligne et vérifiées (HTTP 200).

---

## Risques restants, du plus sérieux au plus anodin

### 1. L'assistant IA — guideline 4.7 « Mini apps, mini games, streaming games, chatbots, plug-ins, and game emulators » — IMPORTANT

`src/screens/ChatScreen.tsx` propose « Le Parrain ». Deux modes coexistent :

- **Par défaut**, les réponses viennent de `src/utils/parrainAI.ts` : elles sont écrites
  à l'avance dans l'application, aucune requête réseau.
- **Si l'utilisateur colle sa propre clé API** dans son profil, les questions partent
  vers `api.anthropic.com` (`src/utils/claudeAPI.ts:52`, seule requête réseau de tout le
  projet) et les réponses sont générées par un modèle.

La guideline 4.7 impose notamment la modération du contenu répréhensible et un contrôle
adapté à l'âge pour les chatbots. Ici, le risque est réduit — la fonction est inactive
par défaut, elle tourne sous le compte de l'utilisateur, et le domaine est celui d'un
fournisseur qui applique ses propres garde-fous — mais un examinateur qui découvre un
champ « clé API » sans explication peut refuser par précaution.

**Correctif :** expliquer le fonctionnement dans les notes de revue (texte prêt dans
`docs/app-store.md`, section 10). Ne pas masquer la fonction : la décrire.

### 2. Aucun moyen de signaler un contenu problématique — guideline 1.2 « User-Generated Content » — MINEUR

La guideline 1.2 vise les contenus publiés par les utilisateurs, ce que KichtApp ne fait
pas : rien n'est partagé, il n'y a ni serveur ni compte. Elle ne s'applique donc pas
directement.

Depuis peu, l'app dispose malgré tout d'un bouton « Ce montant est faux ? » sous chaque
aide, qui ouvre un message vers l'éditeur. Si un examinateur soulève la question d'un
mécanisme de signalement, il est là.

### 3. Code « premium » résiduel — guideline 2.3 « Accurate Metadata » — MINEUR

`src/utils/premium.ts` renvoie `true` pour tout le monde et `src/data/premiumGuides.ts`
porte encore un champ `premium: true`. Vérifié : **aucun de ces éléments n'est visible
par l'utilisateur** — aucune mention d'abonnement, de déblocage ou de contenu réservé
n'apparaît dans les écrans. Le risque serait qu'une future modification les expose sans
qu'un achat intégré existe, ce qu'Apple refuse.

**Correctif (non urgent) :** supprimer ces reliquats quand l'occasion se présente, ou
laisser le commentaire d'avertissement qui les accompagne déjà.

### 4. Comportement sans réseau — guideline 2.1 — VÉRIFIÉ, PAS UN RISQUE

Un examinateur teste souvent en conditions dégradées. Contrôlé :

- L'app est locale : simulateur, budget, agenda, courriers et fiches fonctionnent sans
  aucune connexion.
- Le seul appel réseau échoue proprement : `claudeAPI.ts:70` intercepte la coupure et
  lève une erreur typée `network`, et `ChatScreen.tsx:282` bascule sur la réponse hors
  ligne tout en affichant une bannière explicite. Aucun écran figé, aucun plantage.
- Les écrans vides ont un état dédié (budget sans transaction, agenda sans échéance).

### 5. Langue — VÉRIFIÉ, PAS UN RISQUE

Recherche de chaînes anglaises visibles dans `src/screens/` et `src/components/` :
aucune. Les seules occurrences d'anglais sont des commentaires de code. Le gabarit web
déclarait `lang="en"` : corrigé il y a une semaine.

### 6. Promesses financières — guideline 2.3 — VÉRIFIÉ, ACCEPTABLE

Les formules d'accroche (« Ne passe plus à côté de ton argent », « Trouver l'argent que
je rate ») annoncent une recherche, pas un résultat. Les montants sont systématiquement
présentés au conditionnel (« tu pourrais toucher environ… »), avec la mention que seul
l'organisme décide, et l'app répète son absence d'affiliation avec la CAF et le CROUS.

Point de vigilance : ne jamais afficher un montant à l'indicatif dans les métadonnées de
la fiche. La description rédigée respecte cette règle.

### 7. Liens sortants — VÉRIFIÉ, PAS UN RISQUE

Les liens (caf.fr, ameli.fr, impots.gouv.fr, sites de réseaux de transport) s'ouvrent
via `Linking.openURL`, donc dans Safari, et non dans une vue web intégrée. C'est le
comportement attendu, et cela permet de répondre « non » à la question sur l'accès web
illimité du questionnaire d'âge.

---

## Ce qui reste à faire avant de soumettre

| Action | Qui |
|---|---|
| Ouvrir le compte Apple Developer (99 $/an) | Toi |
| Produire cinq captures d'écran depuis un iPhone | Toi, après TestFlight |
| Coller les notes de revue de `docs/app-store.md` section 10 | Toi |
| Lancer le build : `npx eas-cli build --platform ios --profile production` | Toi (authentification Apple requise) |

Aucun **bloquant** technique n'a été identifié dans le code.
