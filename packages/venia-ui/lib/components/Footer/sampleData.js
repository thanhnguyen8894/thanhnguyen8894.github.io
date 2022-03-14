import { images } from '@magento/venia-ui/lib/constants/images';

const aboutUsOud = new Map()
    .set('footer.storeName', null)
    .set('footer.aboutUs', '/about-us')
    .set('contactPage.title', '/contact-us')
    .set('footer.career', '/career')
    .set('footer.howToOrder', '/howtobuy')
    .set('footer.vatr', {
        logo: images.vatrImage,
        link: 'https://arabianoud.site/vatcer.PDF'
    });

// const oudStore = new Map()
//     .set('footer.ourCompany', null)
//     .set('footer.customerAccount', '/account-information')
//     .set('footer.wishlist', 5)
//     .set('footer.giftCard', '/account-information')
//     .set('footer.login', '/login')
//     .set('footer.returnOfProducts', '/shipping-returns');

const customerServices = new Map()
    .set('footer.customerServicesTitle', null)
    .set('footer.faq', '/faqs')
    .set('footer.privacyPolicy', '/privacy-policy')
    .set('footer.termsAndConditions', '/terms')
    .set('productFullDetail.returnPolicy', '/shipping-returns')
    .set('footer.shipmentPolicy', '/shippmentpolicy')

const payment = new Map()
    .set('footer.you', null)
    .set('navHeader.accountText', 1)
    .set('footer.trackAPackage', 2)
    .set('footer.favourites', 5)

export const DEFAULT_LINKS = new Map()
    .set('aboutUsOud', aboutUsOud)
    .set('customerServices', customerServices)
    .set('payment', payment);

export const SOCIAL_ICONS = new Map()
    .set('Facebook', {
        logo: images.facebookIcon,
        link: 'https://www.facebook.com/ArabianOud/'
    })
    .set('Twitter', {
        logo: images.twitterIcon,
        link: 'https://twitter.com/ArabianOud/'
    })
    .set('Instagram', {
        logo: images.instagramIcon,
        link: 'https://www.instagram.com/arabianoud/'
    })
    .set('Linkedin', {
        logo: images.linkedinIcon,
        link: 'https://www.linkedin.com/company/arabian-oud/'
    });

export const SOCIAL_ICONS_BLACK = new Map()
    .set('Facebook', {
        logo: images.facebookIconBlack,
        link: 'https://www.facebook.com/ArabianOud/'
    })
    .set('Twitter', {
        logo: images.twitterIconBlack,
        link: 'https://twitter.com/ArabianOud/'
    })
    .set('Instagram', {
        logo: images.instagramIconBlack,
        link: 'https://www.instagram.com/arabianoud/'
    })
    .set('Linkedin', {
        logo: images.linkedinIconBlack,
        link: 'https://www.linkedin.com/company/arabian-oud/'
    });
