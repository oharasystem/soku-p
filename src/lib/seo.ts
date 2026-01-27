export interface SEOData {
  title: string;
  description: string;
  jsonLd: string;
}

export function generateMetadata(source: string, target: string): SEOData {
  const s = source.toUpperCase();
  const t = target.toUpperCase();

  const title = `Convert ${s} to ${t} Instantly | Soku-p Privacy Converter`;
  const description = `Free online ${s} to ${t} converter. Secure client-side processing, no server uploads. Fast & Private.`;

  const jsonLdObj = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Soku-p Image Converter",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": description,
    "featureList": `Convert ${s} images to ${t} format securely in your browser without uploading files.`
  };

  return {
    title,
    description,
    jsonLd: JSON.stringify(jsonLdObj)
  };
}
