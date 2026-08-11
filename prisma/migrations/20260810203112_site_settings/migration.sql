-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'settings',
    "constructionMode" BOOLEAN NOT NULL DEFAULT false,
    "constructionTitle" TEXT NOT NULL DEFAULT 'Le site arrive bientôt',
    "constructionMessage" TEXT NOT NULL DEFAULT 'Nous préparons quelque chose de mieux. Revenez très vite.',
    "constructionEta" TIMESTAMP(3),
    "showContact" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
