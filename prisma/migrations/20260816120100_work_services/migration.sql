-- AlterTable
ALTER TABLE "Work" ADD COLUMN     "services" TEXT[];

-- Les projets déjà enregistrés n'ont pas de prestations. Le client Prisma lit
-- un tableau NULL comme un tableau vide, mais les deux restent des valeurs
-- distinctes en base : on aligne l'existant sur ce que produiront les
-- prochaines écritures.
UPDATE "Work" SET "services" = '{}' WHERE "services" IS NULL;
