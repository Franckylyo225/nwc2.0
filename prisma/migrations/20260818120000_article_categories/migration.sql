-- Les rubriques du journal passent d'une énumération figée à une table, pour
-- être gérées depuis l'administration.
--
-- Premier obstacle : en Postgres, créer une table crée aussi un type composite
-- du même nom, et l'énumération occupe déjà « ArticleCategory ». On la met donc
-- de côté le temps du report, et on la supprime une fois vidée de ses lecteurs.
--
-- L'ordre du reste compte tout autant : table, rubriques, rattachement des
-- articles, et seulement ensuite le retrait de l'ancienne colonne. Fait dans
-- l'autre sens, le classement des articles déjà publiés serait perdu.

ALTER TYPE "ArticleCategory" RENAME TO "ArticleCategory_ancien";

-- CreateTable
CREATE TABLE "ArticleCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCategory_slug_key" ON "ArticleCategory"("slug");

-- CreateIndex
CREATE INDEX "ArticleCategory_position_idx" ON "ArticleCategory"("position");

-- Les deux rubriques d'origine, avec les libellés que le site affichait déjà.
INSERT INTO "ArticleCategory" ("id", "name", "slug", "position", "updatedAt")
VALUES
  ('cat_actualites', 'Actualité',       'actualites', 0, CURRENT_TIMESTAMP),
  ('cat_articles',   'Article de fond', 'articles',   1, CURRENT_TIMESTAMP);

-- AlterTable : la colonne arrive facultative, le temps du report.
ALTER TABLE "Article" ADD COLUMN "categoryId" TEXT;

-- Comparaison sur le texte : la colonne porte encore l'ancien type, désormais
-- renommé, et le cast explicite évite toute ambiguïté.
UPDATE "Article" SET "categoryId" = 'cat_actualites' WHERE "category"::text = 'NEWS';
UPDATE "Article" SET "categoryId" = 'cat_articles'   WHERE "category"::text = 'POST';

ALTER TABLE "Article" ALTER COLUMN "categoryId" SET NOT NULL;

-- L'ancienne colonne et son type n'ont plus de lecteur.
DROP INDEX "Article_category_idx";
ALTER TABLE "Article" DROP COLUMN "category";
DROP TYPE "ArticleCategory_ancien";

-- CreateIndex
CREATE INDEX "Article_categoryId_idx" ON "Article"("categoryId");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "ArticleCategory"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
