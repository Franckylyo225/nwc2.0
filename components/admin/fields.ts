/**
 * Description déclarative des champs d'un formulaire admin.
 *
 * Chaque collection décrit ses champs ici ; `ResourceForm` se charge du rendu.
 * C'est ce qui évite d'écrire cinq formulaires quasi identiques à la main.
 */
export type Field =
  | {
      type: "text" | "url" | "date" | "number";
      name: string;
      label: string;
      placeholder?: string;
      help?: string;
      /** Génère automatiquement le slug à partir de ce champ. */
      slugSource?: boolean;
    }
  | {
      type: "slug";
      name: string;
      label: string;
      help?: string;
    }
  | {
      type: "textarea";
      name: string;
      label: string;
      rows?: number;
      placeholder?: string;
      help?: string;
      /** Police à chasse fixe — pratique pour le Markdown. */
      mono?: boolean;
    }
  | {
      type: "lines";
      name: string;
      label: string;
      rows?: number;
      help?: string;
    }
  | {
      type: "select";
      name: string;
      label: string;
      options: { value: string; label: string }[];
      help?: string;
    }
  | {
      type: "image";
      name: string;
      label: string;
      help?: string;
    }
  | {
      type: "checkbox";
      name: string;
      label: string;
      help?: string;
    };

export type FieldValues = Record<string, string | number | boolean | string[] | null>;
