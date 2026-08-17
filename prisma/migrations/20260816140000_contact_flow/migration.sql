-- Le formulaire de contact devient un parcours en trois étapes : les champs
-- collectés changent, la table suit.
--
-- Les colonnes retirées n'ont jamais reçu de donnée — le formulaire précédent
-- n'a pas vécu jusqu'à un premier message. C'est ce qui rend possible d'ajouter
-- ici deux colonnes NOT NULL sans valeur par défaut : sur une table peuplée,
-- Postgres refuserait.

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "projectType",
DROP COLUMN "budget",
DROP COLUMN "company",
ADD COLUMN     "preferredContact" TEXT NOT NULL,
ADD COLUMN     "scope" TEXT NOT NULL,
ADD COLUMN     "services" TEXT[],
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "body" DROP NOT NULL;
