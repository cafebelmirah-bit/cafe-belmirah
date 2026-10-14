import { useEffect } from 'react';

interface JsonLdProps {
  id: string;
  schema: Record<string, any>;
}

export default function JsonLd({ id, schema }: JsonLdProps) {
  useEffect(() => {
    const scriptId = `json-ld-${id}`;
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    scriptTag.textContent = JSON.stringify(schema, null, 2);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) {
        el.remove();
      }
    };
  }, [id, schema]);

  return null;
}
