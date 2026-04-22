// lib/page-content.ts
// Default HTML content for legal pages, used when no DB record exists yet.

export type PageSlug = "terms" | "privacy";

export const PAGE_DEFAULTS: Record<PageSlug, { title: string; content: string }> = {
  terms: {
    title: "Conditions Générales d'Utilisation",
    content: `<h2>1. Présentation de la plateforme</h2>
<p>Mafluencer est une plateforme en ligne dédiée aux créateurs de contenu et aux marques au Maroc. Elle permet aux créateurs de participer à des défis créatifs hebdomadaires, de construire un score de performance public (le « Mafluencer Score ») et de recevoir des missions rémunérées de la part de marques partenaires.</p>

<h2>2. Acceptation des conditions</h2>
<p>En vous inscrivant sur Mafluencer, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.</p>

<h2>3. Inscription et compte utilisateur</h2>
<p>Pour accéder aux fonctionnalités de Mafluencer, vous devez créer un compte en fournissant des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les activités effectuées depuis votre compte.</p>
<p>Mafluencer se réserve le droit de suspendre ou supprimer tout compte dont les informations seraient erronées, frauduleuses ou contraires aux présentes CGU.</p>

<h2>4. Règles d'utilisation</h2>
<p>Les utilisateurs s'engagent à :</p>
<ul>
  <li>Respecter la législation marocaine en vigueur ;</li>
  <li>Ne pas publier de contenus illicites, offensants, diffamatoires ou portant atteinte aux droits de tiers ;</li>
  <li>Ne pas usurper l'identité d'une autre personne ;</li>
  <li>Ne pas tenter de pirater ou de perturber le bon fonctionnement de la plateforme ;</li>
  <li>Respecter les droits de propriété intellectuelle de Mafluencer et des autres utilisateurs.</li>
</ul>

<h2>5. Défis créatifs et soumissions</h2>
<p>Les défis sont publiés par Mafluencer ou par des marques partenaires. En soumettant un contenu, le créateur garantit qu'il en est l'auteur et qu'il dispose de tous les droits nécessaires. Il accorde à Mafluencer une licence non exclusive pour diffuser, afficher et promouvoir ledit contenu sur la plateforme.</p>

<h2>6. Mafluencer Score</h2>
<p>Le Mafluencer Score est un indicateur public de performance calculé automatiquement sur la base de la participation, de l'engagement et de la fiabilité du créateur. Il ne constitue pas une garantie de revenus ni de missions.</p>

<h2>7. Missions rémunérées</h2>
<p>Les missions sont des contrats entre une marque et un créateur, facilités par Mafluencer. Mafluencer perçoit une commission sur chaque transaction. Les paiements sont effectués en MAD (Dirham marocain). Tout litige entre une marque et un créateur doit être signalé à Mafluencer dans les 72 heures suivant la livraison.</p>

<h2>8. Paiements et retraits</h2>
<p>Les créateurs peuvent retirer leurs gains via les moyens de paiement disponibles sur la plateforme. Mafluencer ne saurait être tenu responsable des délais de traitement des établissements bancaires ou des prestataires de paiement tiers.</p>

<h2>9. Limitation de responsabilité</h2>
<p>Mafluencer met tout en œuvre pour assurer la disponibilité et la sécurité de la plateforme, mais ne peut garantir une disponibilité continue et sans interruption. Mafluencer n'est pas responsable des dommages indirects résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme.</p>

<h2>10. Modification des CGU</h2>
<p>Mafluencer se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès leur publication sur la plateforme. Il vous appartient de consulter régulièrement cette page.</p>

<h2>11. Droit applicable et juridiction</h2>
<p>Les présentes CGU sont régies par le droit marocain. En cas de litige, les tribunaux compétents de Casablanca seront seuls compétents, sauf disposition légale contraire.</p>

<h2>12. Contact</h2>
<p>Pour toute question relative aux présentes CGU : <a href="mailto:legal@mafluencer.ma">legal@mafluencer.ma</a></p>`,
  },

  privacy: {
    title: "Politique de Confidentialité",
    content: `<h2>1. Responsable du traitement</h2>
<p>La société Mafluencer, dont le siège social est au Maroc, est responsable du traitement des données personnelles collectées via la plateforme mafluencer.ma.</p>

<h2>2. Données collectées</h2>
<p>Nous collectons les données suivantes :</p>
<ul>
  <li><strong>Données d'identification :</strong> nom, adresse email, photo de profil ;</li>
  <li><strong>Données de profil :</strong> biographie, ville, niches, comptes TikTok et Instagram ;</li>
  <li><strong>Données de performance :</strong> nombre d'abonnés, taux d'engagement, soumissions aux défis ;</li>
  <li><strong>Données financières :</strong> transactions, retraits (sans stockage des informations bancaires complètes) ;</li>
  <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées (via des outils d'analyse anonymisés).</li>
</ul>

<h2>3. Finalités du traitement</h2>
<p>Vos données sont utilisées pour :</p>
<ul>
  <li>Gérer votre compte et vous fournir les services de la plateforme ;</li>
  <li>Calculer et afficher votre Mafluencer Score ;</li>
  <li>Faciliter la mise en relation entre créateurs et marques ;</li>
  <li>Traiter les paiements et les retraits ;</li>
  <li>Vous envoyer des notifications relatives à vos activités sur la plateforme ;</li>
  <li>Améliorer nos services et personnaliser votre expérience ;</li>
  <li>Respecter nos obligations légales.</li>
</ul>

<h2>4. Base légale du traitement</h2>
<p>Le traitement de vos données est fondé sur :</p>
<ul>
  <li>L'exécution du contrat (CGU) auquel vous avez adhéré ;</li>
  <li>Votre consentement pour les communications marketing ;</li>
  <li>Nos intérêts légitimes pour améliorer nos services ;</li>
  <li>Le respect de nos obligations légales conformément à la <strong>loi 09-08</strong> relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.</li>
</ul>

<h2>5. Partage des données</h2>
<p>Nous ne vendons pas vos données personnelles. Nous pouvons les partager avec :</p>
<ul>
  <li>Les marques partenaires, uniquement dans le cadre d'une mission que vous avez acceptée ;</li>
  <li>Nos prestataires techniques (hébergement, paiement, email) soumis à des obligations de confidentialité strictes ;</li>
  <li>Les autorités compétentes si la loi l'exige.</li>
</ul>

<h2>6. Conservation des données</h2>
<p>Vos données sont conservées pendant toute la durée de votre compte actif, puis pendant 3 ans après sa suppression pour des raisons légales. Les données financières sont conservées 10 ans conformément aux obligations comptables marocaines.</p>

<h2>7. Vos droits</h2>
<p>Conformément à la loi 09-08, vous disposez des droits suivants :</p>
<ul>
  <li><strong>Droit d'accès :</strong> obtenir une copie de vos données ;</li>
  <li><strong>Droit de rectification :</strong> corriger des données inexactes ;</li>
  <li><strong>Droit à l'effacement :</strong> supprimer votre compte et vos données ;</li>
  <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements ;</li>
  <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré.</li>
</ul>
<p>Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@mafluencer.ma">privacy@mafluencer.ma</a></p>

<h2>8. Sécurité</h2>
<p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction. Les données sont chiffrées en transit (HTTPS) et au repos.</p>

<h2>9. Cookies</h2>
<p>Nous utilisons des cookies essentiels pour le fonctionnement de la plateforme (authentification, sécurité) et des cookies analytiques anonymisés. Vous pouvez désactiver les cookies non essentiels dans les paramètres de votre navigateur.</p>

<h2>10. Modifications</h2>
<p>Cette politique peut être mise à jour. Nous vous informerons de tout changement significatif par email ou notification sur la plateforme.</p>

<h2>11. Contact et réclamations</h2>
<p>Pour toute question : <a href="mailto:privacy@mafluencer.ma">privacy@mafluencer.ma</a><br>
Vous pouvez également adresser une réclamation à la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP) du Maroc.</p>`,
  },
};
