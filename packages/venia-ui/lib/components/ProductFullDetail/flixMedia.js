import React, { useEffect } from 'react';
import { useAppContext } from '@magento/peregrine/lib/context/app';

const FlixMedia = props => {
    const {
        product
    } = props;

    const [{ rtl: lang }] = useAppContext();

    useEffect(() => {
        if (!product) {
          return;
        }

        const { sku } = product;
        
        // const { regularPrice } = price;
        // const flixPrice= regularPrice ? regularPrice.amount.value : '';
        
        // config FlixMedia
        const flixDistributor = '14311';
        const flixLanguage= lang ? 'ar' : 'd2';
        const flixFallbackLanguage = lang ? 'ae' : 'u1';
        const flixBrand = '';
        const flixSku = sku;
        const flixInpage= 'flix-inpage';
        const flixButton= 'flix-minisite';
        const flixFallback= '';
        // const flixEan = '';
        // const flixMpn = '';
    
        const script = document.createElement('script');
        script.src = '//media.flixfacts.com/js/loader.js';
        script.async = true;
        script.setAttribute('id', 'flixmedia');
        script.setAttribute('data-flix-distributor', flixDistributor);
    
        script.setAttribute('data-flix-ean', flixSku);
        script.setAttribute('data-flix-mpn', flixSku);
    
        script.setAttribute('data-flix-language', flixLanguage);
        script.setAttribute('data-flix-brand', flixBrand);
        script.setAttribute('data-flix-sku', flixSku);
        script.setAttribute('data-flix-inpage', flixInpage);
        script.setAttribute('data-flix-button', flixButton);
        script.setAttribute('data-flix-price', '');
        script.setAttribute('data-flix-fallback', flixFallback);

        script.setAttribute('data-flix-fallback-language', flixFallbackLanguage);        
        document.getElementsByTagName('head')[0].appendChild(script);
    
        return () => {
          const previousScript = document.getElementById('flixmedia');
          if (previousScript && previousScript.parentNode) {
            previousScript.parentNode.removeChild(previousScript);
          }
        }
    }, [product, lang]);

    return (
      <div>
        <div id="flix-minisite"></div>
        <div id="flix-inpage"></div>
      </div>
    );
};

export default FlixMedia;
