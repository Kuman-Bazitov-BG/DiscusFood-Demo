// All UI copy lives here, keyed by language. English is the source of truth;
// Greek (el) and Bulgarian (bg) mirror the same keys.

export type Language = 'en' | 'el' | 'bg'

export const LANGUAGES: { code: Language; label: string; nativeLabel: string; flag: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'el', label: 'Greek', nativeLabel: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'bg', label: 'Bulgarian', nativeLabel: 'Български', flag: '🇧🇬' },
]

export type TranslationKey = keyof (typeof translations)['en']

export const translations = {
  en: {
    // Navbar
    'nav.shop': 'Shop',
    'nav.catalog': 'Catalog',
    'nav.whyUs': 'Why us',
    'nav.contact': 'Contact',
    'nav.cart': 'Cart',
    'nav.language': 'Language',
    'nav.home': 'Home',
    'nav.welcome': 'Welcome',
    'nav.tagline': 'Bring nature into your home',
    'home.eyebrow': 'Premium aquarium nutrition',
    'home.heading': 'Food that grows champions.',
    'home.subtitle':
      'A handful of our favourites — soft granulates developed for discus and demanding aquarium fish. Explore the full range in the catalogue.',
    'home.featured': 'Featured',
    'home.viewDetails': 'View details',
    'home.browseAll': 'Browse the full catalogue',

    // Catalog drawer
    'catalog.title': 'Catalog',
    'catalog.close': 'Close catalog',
    'catalog.tabProducts': 'Products',
    'catalog.tabComing': 'New Products',
    'catalog.emptyProducts': 'No products available yet — check the “New Products” tab!',
    'catalog.emptyComing': 'No upcoming products right now.',
    'catalog.download': 'Download Catalog',
    'catalog.downloadHint': 'Get our PDF catalogs',
    'catalog.downloadSub': 'Choose a catalog to download as PDF.',
    'catalog.dlProducts': 'Products Catalog',
    'catalog.dlProductsDesc': '2025 — our complete product range.',
    'catalog.dlNew': 'New Products Catalog',
    'catalog.dlNewDesc': '2026 — new arrivals, coming soon.',
    'catalog.dlButton': 'Download PDF',
    'catalog.dlOpen': 'Open PDF',
    'search.heading': 'Find your fish food',
    'search.placeholder': 'Search products…',
    'search.button': 'Search',
    'search.noResults': 'No products found.',
    'search.viewAll': 'View all results',
    'search.comingSoon': 'Coming soon',

    // Language drawer
    'lang.title': 'Choose language',
    'lang.subtitle': 'Select your preferred language.',
    'lang.close': 'Close language menu',

    // Hero
    'hero.badge': 'Vet-formulated nutrition',
    'hero.title1': 'Vibrant color.',
    'hero.title2': 'Healthier discus.',
    'hero.subtitle':
      'Premium foods crafted for the unique needs of discus fish — for richer colors, stronger growth, and happier tanks.',
    'hero.shop': 'Shop the collection',
    'hero.why': 'Why DiscusFish',
    'hero.rating': '⭐ 4.9/5 from 2,000+ keepers',
    'hero.shipping': '🚚 Free shipping over €75',
    'hero.cardTitle': 'Premium Discus Granules',
    'hero.cardSubtitle': 'Color-enhancing · high protein',

    // Product grid
    'products.title': 'Shop our discus foods',
    'products.subtitle':
      'Carefully formulated blends to keep your discus colorful, active, and thriving.',

    // Product card
    'product.addToCart': 'Add to cart',
    'product.soldOut': 'Sold out',
    'product.comingSoon': 'Coming soon…',
    'product.back': 'Back to catalog',
    'product.details': 'Details',
    'product.fromCatalog': 'From the Discusfood 2024/25 catalog',
    'product.fromCatalogSub': 'The full product page exactly as it appears in our printed catalog.',
    'product.noCatalog': 'No catalog page available for this product yet.',
    'product.notFound': 'Product not found.',
    'product.loading': 'Loading…',
    'product.viewDetails': 'View details',

    // CTA banner
    'cta.title': 'Nutrition that brings out their best',
    'cta.subtitle':
      'From fry to full-grown showpieces, our foods are built to deepen color and fuel healthy growth — naturally.',
    'cta.shopNow': 'Shop now',

    // Features
    'features.title': 'Made for happy, healthy discus',
    'features.subtitle':
      'Everything we make is designed around what discus actually need.',
    'features.color.title': 'Color enhancing',
    'features.color.text':
      'Natural astaxanthin and carotenoids bring out deep reds and blues.',
    'features.vet.title': 'Vet-formulated',
    'features.vet.text': 'Balanced protein and nutrients tuned to the discus diet.',
    'features.water.title': 'Clean water',
    'features.water.text':
      'Low-waste recipes that won’t cloud your tank or spike ammonia.',
    'features.shipping.title': 'Fast shipping',
    'features.shipping.text':
      'Free delivery on orders over €75, shipped within 24 hours.',

    // Why Us page
    'whyUs.heading': 'Why Choose Discusfood?',
    'whyUs.intro':
      'When it comes to keeping discus and other demanding aquarium fish, there is no room for compromise. At Discusfood, we share your passion for fishkeeping and understand that the health, longevity, and vibrant colors of your fish begin with the perfect diet.',
    'whyUs.ingredients.title': 'Uncompromising Ingredient Quality',
    'whyUs.ingredients.text':
      'Every pellet and flake we offer is crafted from premium raw materials. We use carefully selected proteins, vitamins, and minerals that replicate the natural diet of your fish. No unnecessary fillers, no artificial substitutes — just pure, wholesome nutrition.',
    'whyUs.formulas.title': 'Specialized Formulas for Exceptional Results',
    'whyUs.formulas.text':
      'Discus and other delicate tropical species require a specific balance of nutrients. Our products are developed based on years of scientific research and hands-on experience to ensure:',
    'whyUs.formulas.immune': 'Immune System Support: For stronger, more resilient fish.',
    'whyUs.formulas.color':
      "Natural Color Enhancement: Premium ingredients that bring out the absolute best in your fish's natural pigmentation.",
    'whyUs.formulas.growth':
      'Optimal Growth & Shape: Supporting healthy physical development from fry to fully grown adults.',
    'whyUs.water.title': 'Crystal Clear Water',
    'whyUs.water.text':
      'One of the biggest challenges in feeding is aquarium pollution. Discusfood diets feature a specialized structure that holds its shape in the water for longer. Because our food is highly digestible, it drastically reduces fish waste, helping you maintain crystal-clear water and stable tank parameters.',
    'whyUs.delivery.title': 'Fast & Secure Delivery',
    'whyUs.delivery.text':
      'We know how important it is that your fish never run out of their favourite food. We process and dispatch orders as quickly as possible. Every package is carefully sealed and shipped to ensure the food arrives at your door in perfect condition, locking in its maximum freshness and nutritional value.',
    'whyUs.expertise.title': 'Expertise & Shared Passion',
    'whyUs.expertise.text':
      'We don\'t just sell fish food — we are proud members of the aquarist community. Whether you are a beginner enthusiast or a professional breeder, we are always here to help you choose the perfect nutritional plan tailored to your specific needs.',

    // Footer
    'footer.tagline':
      'Premium nutrition for vibrant, healthy discus. Made by keepers, for keepers.',
    'footer.shop': 'Shop',
    'footer.allFoods': 'All foods',
    'footer.bestSellers': 'Best sellers',
    'footer.support': 'Support',
    'footer.whyUs': 'Why us',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved.',

    // Cart drawer
    'cart.title': 'Your cart',
    'cart.close': 'Close cart',
    'cart.empty': 'Your cart is empty',
    'cart.emptyHint': 'Add some food to keep your discus happy.',
    'cart.remove': 'Remove',
    'cart.clear': 'Clear cart',
    'cart.subtotal': 'Subtotal',
    'cart.checkout': 'Checkout',
    'cart.redirecting': 'Redirecting…',
    'cart.securePayment': 'Secure payment powered by Stripe',
    'cart.error':
      'Checkout isn’t available yet — the payments back-end still needs to be configured.',
    'cart.decrease': 'Decrease quantity',
    'cart.increase': 'Increase quantity',
    'cart.shipping': 'Shipping',
    'cart.shippingFree': 'FREE',
    'cart.shippingProgress': 'Add {amount} more for free shipping',
    'cart.shippingUnlocked': '🎉 You\'ve unlocked free shipping!',
    'cart.total': 'Total',

    // Auth
    'auth.login': 'Log in',
    'auth.signup': 'Sign up',
    'auth.logout': 'Log out',
    'auth.loginTitle': 'Welcome back',
    'auth.signupTitle': 'Create your account',
    'auth.changePasswordTitle': 'Change password',
    'auth.resetPasswordTitle': 'Reset password',
    'auth.username': 'User name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.oldPassword': 'Old password',
    'auth.newPassword': 'New password',
    'auth.passwordHint': 'At least 6 characters',
    'auth.confirmPassword': 'Confirm password',
    'auth.confirmNewPassword': 'Confirm new password',
    'auth.createAccount': 'Create account',
    'auth.changePassword': 'Change password',
    'auth.resetPassword': 'Reset password',
    'auth.backToLogin': 'Back to log in',
    'auth.done': 'Done',
    'auth.haveAccount': 'Already have an account?',
    'auth.noAccount': 'No account yet?',
    'auth.close': 'Close',
    'auth.adminPanel': 'Admin panel',
    'auth.signingIn': 'Logging in…',
    'auth.creating': 'Creating…',
    'auth.sendingReset': 'Sending…',
    'auth.updatingPassword': 'Updating…',
    'auth.errPasswordShort': 'Password must be at least 6 characters.',
    'auth.errPasswordMatch': 'Passwords do not match.',
    'auth.errFields': 'Please fill in all fields.',
    'auth.loginSuccess': 'Logged in successfully.',
    'auth.signupSuccess': 'Account created! You can now log in.',
    'auth.resetSent': 'Password reset email sent. Check your inbox.',
    'auth.passwordUpdated': 'Password updated.',
    // Account type tabs + business account
    'auth.personalTab': 'Personal account',
    'auth.businessTab': 'Business account',
    'auth.businessSignupTitle': 'Create your business account',
    'auth.accountDetails': 'Account details',
    'auth.companyDetails': 'Company details',
    'auth.billingAddress': 'Billing address',
    'auth.companyName': 'Legal company name',
    'auth.vatNumber': 'VAT / Tax ID',
    'auth.registrationNumber': 'Company registration number (optional)',
    'auth.contactName': 'Contact person',
    'auth.phone': 'Phone number',
    'auth.billingEmail': 'Billing email (optional)',
    'auth.addressLine1': 'Address line 1',
    'auth.addressLine2': 'Address line 2 (optional)',
    'auth.city': 'City',
    'auth.state': 'State / Province / Region (optional)',
    'auth.postalCode': 'Postal / ZIP code',
    'auth.country': 'Country',
    'auth.createBusinessAccount': 'Create business account',
  },

  el: {
    // Navbar
    'nav.shop': 'Κατάστημα',
    'nav.catalog': 'Κατάλογος',
    'nav.whyUs': 'Γιατί εμάς',
    'nav.contact': 'Επικοινωνία',
    'nav.cart': 'Καλάθι',
    'nav.language': 'Γλώσσα',
    'nav.home': 'Αρχική',
    'nav.welcome': 'Καλώς ήρθατε',
    'nav.tagline': 'Φέρτε τη φύση στο σπίτι σας',
    'home.eyebrow': 'Premium διατροφή ενυδρείου',
    'home.heading': 'Τροφή που μεγαλώνει πρωταθλητές.',
    'home.subtitle':
      'Μερικά από τα αγαπημένα μας — μαλακά granulate σχεδιασμένα για discus και απαιτητικά ψάρια ενυδρείου. Εξερευνήστε όλη τη γκάμα στον κατάλογο.',
    'home.featured': 'Προτεινόμενο',
    'home.viewDetails': 'Δείτε λεπτομέρειες',
    'home.browseAll': 'Δείτε όλον τον κατάλογο',

    // Catalog drawer
    'catalog.title': 'Κατάλογος',
    'catalog.close': 'Κλείσιμο καταλόγου',
    'catalog.tabProducts': 'Προϊόντα',
    'catalog.tabComing': 'Νέα Προϊόντα',
    'catalog.emptyProducts': 'Δεν υπάρχουν διαθέσιμα προϊόντα ακόμη — δείτε την καρτέλα «Σύντομα»!',
    'catalog.emptyComing': 'Δεν υπάρχουν επερχόμενα προϊόντα αυτή τη στιγμή.',
    'catalog.download': 'Λήψη Καταλόγου',
    'catalog.downloadHint': 'Κατεβάστε τους καταλόγους PDF',
    'catalog.downloadSub': 'Επιλέξτε κατάλογο για λήψη σε PDF.',
    'catalog.dlProducts': 'Κατάλογος Προϊόντων',
    'catalog.dlProductsDesc': '2025 — όλη η γκάμα προϊόντων μας.',
    'catalog.dlNew': 'Κατάλογος Νέων Προϊόντων',
    'catalog.dlNewDesc': '2026 — νέες αφίξεις, σύντομα κοντά σας.',
    'catalog.dlButton': 'Λήψη PDF',
    'catalog.dlOpen': 'Άνοιγμα PDF',
    'search.heading': 'Βρείτε την τροφή σας',
    'search.placeholder': 'Αναζήτηση προϊόντων…',
    'search.button': 'Αναζήτηση',
    'search.noResults': 'Δεν βρέθηκαν προϊόντα.',
    'search.viewAll': 'Δείτε όλα τα αποτελέσματα',
    'search.comingSoon': 'Σύντομα',

    // Language drawer
    'lang.title': 'Επιλέξτε γλώσσα',
    'lang.subtitle': 'Επιλέξτε την προτιμώμενη γλώσσα σας.',
    'lang.close': 'Κλείσιμο μενού γλώσσας',

    // Hero
    'hero.badge': 'Διατροφή με κτηνιατρική σύσταση',
    'hero.title1': 'Ζωντανό χρώμα.',
    'hero.title2': 'Πιο υγιή discus.',
    'hero.subtitle':
      'Premium τροφές φτιαγμένες για τις ιδιαίτερες ανάγκες των ψαριών discus — για πιο πλούσια χρώματα, πιο δυνατή ανάπτυξη και πιο ευτυχισμένα ενυδρεία.',
    'hero.shop': 'Δείτε τη συλλογή',
    'hero.why': 'Γιατί DiscusFish',
    'hero.rating': '⭐ 4.9/5 από 2.000+ εκτροφείς',
    'hero.shipping': '🚚 Δωρεάν αποστολή άνω των €75',
    'hero.cardTitle': 'Premium Κόκκοι Discus',
    'hero.cardSubtitle': 'Ενίσχυση χρώματος · υψηλή πρωτεΐνη',

    // Product grid
    'products.title': 'Αγοράστε τις τροφές discus μας',
    'products.subtitle':
      'Προσεκτικά διαμορφωμένα μείγματα για να κρατούν τα discus σας πολύχρωμα, δραστήρια και ακμαία.',

    // Product card
    'product.addToCart': 'Προσθήκη στο καλάθι',
    'product.soldOut': 'Εξαντλήθηκε',
    'product.comingSoon': 'Σύντομα κοντά σας…',
    'product.back': 'Επιστροφή στον κατάλογο',
    'product.details': 'Λεπτομέρειες',
    'product.fromCatalog': 'Από τον κατάλογο Discusfood 2024/25',
    'product.fromCatalogSub': 'Η πλήρης σελίδα προϊόντος όπως ακριβώς εμφανίζεται στον έντυπο κατάλογό μας.',
    'product.noCatalog': 'Δεν υπάρχει ακόμη σελίδα καταλόγου για αυτό το προϊόν.',
    'product.notFound': 'Το προϊόν δεν βρέθηκε.',
    'product.loading': 'Φόρτωση…',
    'product.viewDetails': 'Δείτε λεπτομέρειες',

    // CTA banner
    'cta.title': 'Διατροφή που αναδεικνύει τον καλύτερό τους εαυτό',
    'cta.subtitle':
      'Από τα μικρά μέχρι τα πλήρως ανεπτυγμένα εκθεσιακά ψάρια, οι τροφές μας ενισχύουν το χρώμα και τροφοδοτούν την υγιή ανάπτυξη — φυσικά.',
    'cta.shopNow': 'Αγοράστε τώρα',

    // Features
    'features.title': 'Φτιαγμένο για ευτυχισμένα, υγιή discus',
    'features.subtitle':
      'Όλα όσα φτιάχνουμε σχεδιάζονται γύρω από αυτό που πραγματικά χρειάζονται τα discus.',
    'features.color.title': 'Ενίσχυση χρώματος',
    'features.color.text':
      'Η φυσική ασταξανθίνη και τα καροτενοειδή αναδεικνύουν βαθιά κόκκινα και μπλε.',
    'features.vet.title': 'Κτηνιατρική σύσταση',
    'features.vet.text':
      'Ισορροπημένη πρωτεΐνη και θρεπτικά συστατικά προσαρμοσμένα στη διατροφή των discus.',
    'features.water.title': 'Καθαρό νερό',
    'features.water.text':
      'Συνταγές χαμηλών αποβλήτων που δεν θολώνουν το ενυδρείο ούτε αυξάνουν την αμμωνία.',
    'features.shipping.title': 'Γρήγορη αποστολή',
    'features.shipping.text':
      'Δωρεάν παράδοση για παραγγελίες άνω των €75, αποστολή εντός 24 ωρών.',

    // Why Us page
    'whyUs.heading': 'Γιατί να Επιλέξετε το Discusfood;',
    'whyUs.intro':
      'Όταν πρόκειται για τη συντήρηση discus και άλλων απαιτητικών ενυδρείων ψαριών, δεν υπάρχουν περιθώρια συμβιβασμού. Στο Discusfood, μοιραζόμαστε το πάθος σας για τα ψάρια και κατανοούμε ότι η υγεία, η μακροζωία και τα ζωντανά χρώματά τους ξεκινούν από τη σωστή διατροφή.',
    'whyUs.ingredients.title': 'Αδιαπραγμάτευτη Ποιότητα Συστατικών',
    'whyUs.ingredients.text':
      'Κάθε κόκκος και νιφάδα που προσφέρουμε παράγεται από premium πρώτες ύλες. Χρησιμοποιούμε προσεκτικά επιλεγμένες πρωτεΐνες, βιταμίνες και μέταλλα που αναπαράγουν τη φυσική διατροφή των ψαριών σας. Χωρίς περιττά γεμιστικά, χωρίς τεχνητά υποκατάστατα — μόνο αγνή, ολοκληρωμένη διατροφή.',
    'whyUs.formulas.title': 'Εξειδικευμένοί Τύποι για Εξαιρετικά Αποτελέσματα',
    'whyUs.formulas.text':
      'Τα Discus και άλλα ευαίσθητα τροπικά είδη χρειάζονται συγκεκριμένη ισορροπία θρεπτικών συστατικών. Τα προϊόντα μας αναπτύσσονται βάσει χρόνων επιστημονικής έρευνας και πρακτικής εμπειρίας:',
    'whyUs.formulas.immune': 'Ενίσχυση Ανοσοποιητικού: Για ισχυρότερα και πιο ανθεκτικά ψάρια.',
    'whyUs.formulas.color':
      'Φυσική Ενίσχυση Χρώματος: Premium συστατικά που αναδεικνύουν το απόλυτο καλύτερο από τη φυσική χρωματική τους αίγλη.',
    'whyUs.formulas.growth':
      'Βέλτιστη Ανάπτυξη & Σχήμα: Υποστήριξη υγιούς φυσικής ανάπτυξης από τα μεταγόνια ψάρια έως τα πλήρως ανεπτυγμένα.',
    'whyUs.water.title': 'Κρυστάλλινο Νερό',
    'whyUs.water.text':
      'Μία από τις μεγαλύτερες προκλήσεις στη σίτιση είναι η ρύπανση του ενυδρείου. Οι τροφές Discusfood διαθέτουν εξειδικευμένη δομή που διατηρεί το σχήμα τους στο νερό για περισσότερο. Λόγω της υψηλής πεπτικότητάς τους, μειώνουν δραστικά τα απόβλητα των ψαριών, βοηθώντας σας να διατηρείτε κρυστάλλινο νερό και σταθερές παραμέτρους.',
    'whyUs.delivery.title': 'Γρήγορη & Ασφαλής Παράδοση',
    'whyUs.delivery.text':
      'Ξέρουμε πόσο σημαντικό είναι τα ψάρια σας να μην ξεμένουν ποτέ από την αγαπημένη τους τροφή. Επεξεργαζόμαστε και αποστέλλουμε παραγγελίες το συντομότερο δυνατό. Κάθε πακέτο σφραγίζεται και αποστέλλεται προσεκτικά ώστε η τροφή να φτάσει στην πόρτα σας σε άριστη κατάσταση, διατηρώντας τη μέγιστη φρεσκάδα και θρεπτική αξία της.',
    'whyUs.expertise.title': 'Τεχνογνωσία & Κοινό Πάθος',
    'whyUs.expertise.text':
      'Δεν πουλάμε απλώς τροφή για ψάρια — είμαστε περήφανα μέλη της κοινότητας των ενυδρειόφιλων. Είτε είστε αρχάριος λάτρης είτε επαγγελματίας εκτροφέας, είμαστε πάντα εδώ για να σας βοηθήσουμε να επιλέξετε το τέλειο διατροφικό πλάνο ανάλογα με τις συγκεκριμένες ανάγκες σας.',

    // Footer
    'footer.tagline':
      'Premium διατροφή για ζωντανά, υγιή discus. Φτιαγμένη από εκτροφείς, για εκτροφείς.',
    'footer.shop': 'Κατάστημα',
    'footer.allFoods': 'Όλες οι τροφές',
    'footer.bestSellers': 'Δημοφιλέστερα',
    'footer.support': 'Υποστήριξη',
    'footer.whyUs': 'Γιατί εμάς',
    'footer.contact': 'Επικοινωνία',
    'footer.rights': 'Με την επιφύλαξη παντός δικαιώματος.',

    // Cart drawer
    'cart.title': 'Το καλάθι σας',
    'cart.close': 'Κλείσιμο καλαθιού',
    'cart.empty': 'Το καλάθι σας είναι άδειο',
    'cart.emptyHint': 'Προσθέστε λίγη τροφή για να κρατήσετε τα discus σας ευτυχισμένα.',
    'cart.remove': 'Αφαίρεση',
    'cart.clear': 'Άδειασμα καλαθιού',
    'cart.subtotal': 'Υποσύνολο',
    'cart.checkout': 'Ολοκλήρωση αγοράς',
    'cart.redirecting': 'Ανακατεύθυνση…',
    'cart.securePayment': 'Ασφαλής πληρωμή μέσω Stripe',
    'cart.error':
      'Η ολοκλήρωση αγοράς δεν είναι ακόμη διαθέσιμη — το σύστημα πληρωμών πρέπει να ρυθμιστεί.',
    'cart.decrease': 'Μείωση ποσότητας',
    'cart.increase': 'Αύξηση ποσότητας',
    'cart.shipping': 'Μεταφορικά',
    'cart.shippingFree': 'ΔΩΡΕΑΝ',
    'cart.shippingProgress': 'Προσθέστε άλλα {amount} για δωρεάν αποστολή',
    'cart.shippingUnlocked': '🎉 Ξεκλειδώσατε τη δωρεάν αποστολή!',
    'cart.total': 'Σύνολο',

    // Auth
    'auth.login': 'Σύνδεση',
    'auth.signup': 'Εγγραφή',
    'auth.logout': 'Αποσύνδεση',
    'auth.loginTitle': 'Καλώς ήρθατε ξανά',
    'auth.signupTitle': 'Δημιουργήστε τον λογαριασμό σας',
    'auth.changePasswordTitle': 'Αλλαγή κωδικού',
    'auth.resetPasswordTitle': 'Επαναφορά κωδικού',
    'auth.username': 'Όνομα χρήστη',
    'auth.email': 'Email',
    'auth.password': 'Κωδικός',
    'auth.oldPassword': 'Παλιός κωδικός',
    'auth.newPassword': 'Νέος κωδικός',
    'auth.passwordHint': 'Τουλάχιστον 6 χαρακτήρες',
    'auth.confirmPassword': 'Επιβεβαίωση κωδικού',
    'auth.confirmNewPassword': 'Επιβεβαίωση νέου κωδικού',
    'auth.createAccount': 'Δημιουργία λογαριασμού',
    'auth.changePassword': 'Αλλαγή κωδικού',
    'auth.resetPassword': 'Επαναφορά κωδικού',
    'auth.backToLogin': 'Πίσω στη σύνδεση',
    'auth.done': 'Τέλος',
    'auth.haveAccount': 'Έχετε ήδη λογαριασμό;',
    'auth.noAccount': 'Δεν έχετε λογαριασμό;',
    'auth.close': 'Κλείσιμο',
    'auth.adminPanel': 'Πίνακας διαχείρισης',
    'auth.signingIn': 'Σύνδεση…',
    'auth.creating': 'Δημιουργία…',
    'auth.sendingReset': 'Αποστολή…',
    'auth.updatingPassword': 'Ενημέρωση…',
    'auth.errPasswordShort': 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.',
    'auth.errPasswordMatch': 'Οι κωδικοί δεν ταιριάζουν.',
    'auth.errFields': 'Συμπληρώστε όλα τα πεδία.',
    'auth.loginSuccess': 'Συνδεθήκατε με επιτυχία.',
    'auth.signupSuccess': 'Ο λογαριασμός δημιουργήθηκε! Μπορείτε τώρα να συνδεθείτε.',
    'auth.resetSent': 'Το email επαναφοράς κωδικού στάλθηκε. Ελέγξτε τα εισερχόμενά σας.',
    'auth.passwordUpdated': 'Ο κωδικός ενημερώθηκε.',
    // Account type tabs + business account
    'auth.personalTab': 'Προσωπικός λογαριασμός',
    'auth.businessTab': 'Επαγγελματικός λογαριασμός',
    'auth.businessSignupTitle': 'Δημιουργήστε τον επαγγελματικό σας λογαριασμό',
    'auth.accountDetails': 'Στοιχεία λογαριασμού',
    'auth.companyDetails': 'Στοιχεία εταιρείας',
    'auth.billingAddress': 'Διεύθυνση τιμολόγησης',
    'auth.companyName': 'Νόμιμη επωνυμία εταιρείας',
    'auth.vatNumber': 'ΑΦΜ / VAT',
    'auth.registrationNumber': 'Αριθμός μητρώου εταιρείας (προαιρετικό)',
    'auth.contactName': 'Υπεύθυνος επικοινωνίας',
    'auth.phone': 'Αριθμός τηλεφώνου',
    'auth.billingEmail': 'Email τιμολόγησης (προαιρετικό)',
    'auth.addressLine1': 'Διεύθυνση (γραμμή 1)',
    'auth.addressLine2': 'Διεύθυνση (γραμμή 2) (προαιρετικό)',
    'auth.city': 'Πόλη',
    'auth.state': 'Νομός / Περιφέρεια (προαιρετικό)',
    'auth.postalCode': 'Ταχυδρομικός κώδικας',
    'auth.country': 'Χώρα',
    'auth.createBusinessAccount': 'Δημιουργία επαγγελματικού λογαριασμού',
  },

  bg: {
    // Navbar
    'nav.shop': 'Магазин',
    'nav.catalog': 'Каталог',
    'nav.whyUs': 'Защо нас',
    'nav.contact': 'Контакт',
    'nav.cart': 'Количка',
    'nav.language': 'Език',
    'nav.home': 'Начало',
    'nav.welcome': 'Добре дошли',
    'nav.tagline': 'Внесете природата у дома',
    'home.eyebrow': 'Премиум аквариумно хранене',
    'home.heading': 'Храна, която отглежда шампиони.',
    'home.subtitle':
      'Няколко от нашите любими — меки гранули, разработени за дискус и взискателни аквариумни риби. Разгледайте цялата гама в каталога.',
    'home.featured': 'Препоръчано',
    'home.viewDetails': 'Вижте детайли',
    'home.browseAll': 'Разгледайте целия каталог',

    // Catalog drawer
    'catalog.title': 'Каталог',
    'catalog.close': 'Затвори каталога',
    'catalog.tabProducts': 'Продукти',
    'catalog.tabComing': 'Нови продукти',
    'catalog.emptyProducts': 'Все още няма налични продукти — вижте раздел „Очаквайте скоро“!',
    'catalog.emptyComing': 'В момента няма предстоящи продукти.',
    'catalog.download': 'Изтегли каталог',
    'catalog.downloadHint': 'Изтеглете нашите PDF каталози',
    'catalog.downloadSub': 'Изберете каталог за изтегляне в PDF.',
    'catalog.dlProducts': 'Каталог с продукти',
    'catalog.dlProductsDesc': '2025 — пълната ни гама продукти.',
    'catalog.dlNew': 'Каталог нови продукти',
    'catalog.dlNewDesc': '2026 — нови продукти, очаквайте скоро.',
    'catalog.dlButton': 'Изтегли PDF',
    'catalog.dlOpen': 'Отвори PDF',
    'search.heading': 'Намерете вашата храна',
    'search.placeholder': 'Търсене на продукти…',
    'search.button': 'Търсене',
    'search.noResults': 'Няма намерени продукти.',
    'search.viewAll': 'Вижте всички резултати',
    'search.comingSoon': 'Очаквайте скоро',

    // Language drawer
    'lang.title': 'Изберете език',
    'lang.subtitle': 'Изберете предпочитания от вас език.',
    'lang.close': 'Затваряне на менюто за език',

    // Hero
    'hero.badge': 'Хранене с ветеринарна формула',
    'hero.title1': 'Ярки цветове.',
    'hero.title2': 'По-здрави дискуси.',
    'hero.subtitle':
      'Премиум храни, създадени за уникалните нужди на рибите дискус — за по-наситени цветове, по-силен растеж и по-щастливи аквариуми.',
    'hero.shop': 'Разгледай колекцията',
    'hero.why': 'Защо DiscusFish',
    'hero.rating': '⭐ 4.9/5 от над 2000 развъдчици',
    'hero.shipping': '🚚 Безплатна доставка над €75',
    'hero.cardTitle': 'Премиум гранули за дискус',
    'hero.cardSubtitle': 'Подсилва цвета · високо съдържание на протеин',

    // Product grid
    'products.title': 'Разгледайте нашите храни за дискус',
    'products.subtitle':
      'Внимателно разработени смеси, които поддържат вашите дискуси цветни, активни и в отлично здраве.',

    // Product card
    'product.addToCart': 'Добави в количката',
    'product.soldOut': 'Изчерпано',
    'product.comingSoon': 'Очаквайте скоро…',
    'product.back': 'Обратно към каталога',
    'product.details': 'Подробности',
    'product.fromCatalog': 'От каталога Discusfood 2024/25',
    'product.fromCatalogSub': 'Цялата продуктова страница, точно както изглежда в печатния ни каталог.',
    'product.noCatalog': 'Все още няма каталожна страница за този продукт.',
    'product.notFound': 'Продуктът не е намерен.',
    'product.loading': 'Зареждане…',
    'product.viewDetails': 'Виж подробности',

    // CTA banner
    'cta.title': 'Хранене, което разкрива най-доброто от тях',
    'cta.subtitle':
      'От малките до напълно израсналите изложбени екземпляри, нашите храни са създадени да задълбочат цвета и да захранят здравословния растеж — естествено.',
    'cta.shopNow': 'Купи сега',

    // Features
    'features.title': 'Създадено за щастливи, здрави дискуси',
    'features.subtitle':
      'Всичко, което правим, е проектирано според това, от което дискусите наистина се нуждаят.',
    'features.color.title': 'Подсилване на цвета',
    'features.color.text':
      'Естественият астаксантин и каротеноидите подчертават наситени червени и сини нюанси.',
    'features.vet.title': 'Ветеринарна формула',
    'features.vet.text':
      'Балансиран протеин и хранителни вещества, съобразени с диетата на дискуса.',
    'features.water.title': 'Чиста вода',
    'features.water.text':
      'Рецепти с малко отпадъци, които няма да размътят аквариума или да повишат амоняка.',
    'features.shipping.title': 'Бърза доставка',
    'features.shipping.text':
      'Безплатна доставка за поръчки над €75, изпратена в рамките на 24 часа.',

    // Why Us page
    'whyUs.heading': 'Защо да Изберете Discusfood?',
    'whyUs.intro':
      'Когато става дума за отглеждане на дискуси и други взискателни аквариумни риби, няма място за компромис. В Discusfood споделяме вашата страст към рибовъдството и разбираме, че здравето, дълголетието и ярките цветове на рибите ви започват с перфектната диета.',
    'whyUs.ingredients.title': 'Безкомпромисно Качество на Съставките',
    'whyUs.ingredients.text':
      'Всяка гранула и люспица, която предлагаме, е изработена от висококачествени суровини. Използваме внимателно подбрани протеини, витамини и минерали, които пресъздават естествената диета на вашите риби. Без ненужни пълнители, без изкуствени заместители — само чисто, пълноценно хранене.',
    'whyUs.formulas.title': 'Специализирани Формули за Изключителни Резултати',
    'whyUs.formulas.text':
      'Дискусите и другите деликатни тропически видове изискват специфичен баланс на хранителни вещества. Нашите продукти са разработени въз основа на години научни изследвания и практически опит:',
    'whyUs.formulas.immune': 'Подкрепа на Имунната Система: За по-силни и по-устойчиви риби.',
    'whyUs.formulas.color':
      'Естествено Подобряване на Цвета: Премиум съставки, които извличат абсолютното най-добро от естественото оцветяване на рибите ви.',
    'whyUs.formulas.growth':
      'Оптимален Растеж и Форма: Подпомагане на здравословното физическо развитие от малки до напълно израснали екземпляри.',
    'whyUs.water.title': 'Кристално Чиста Вода',
    'whyUs.water.text':
      'Едно от най-големите предизвикателства при храненето е замърсяването на аквариума. Храните Discusfood имат специализирана структура, която запазва формата си във водата по-дълго. Тъй като храната ни е силно смилаема, тя драстично намалява отпадъците от рибите, помагайки ви да поддържате кристално чиста вода и стабилни параметри на аквариума.',
    'whyUs.delivery.title': 'Бърза и Сигурна Доставка',
    'whyUs.delivery.text':
      'Знаем колко е важно рибите ви никога да не останат без любимата им храна. Обработваме и изпращаме поръчките възможно най-бързо. Всеки пакет е внимателно запечатан и изпратен, за да пристигне храната при вас в перфектно състояние, запазвайки максималната си свежест и хранителна стойност.',
    'whyUs.expertise.title': 'Експертиза и Споделена Страст',
    'whyUs.expertise.text':
      'Ние не просто продаваме рибна храна — ние сме горди членове на аквариумната общност. Независимо дали сте начинаещ ентусиаст или професионален развъдчик, ние винаги сме тук, за да ви помогнем да изберете перфектния хранителен план, съобразен с вашите специфични нужди.',

    // Footer
    'footer.tagline':
      'Премиум хранене за ярки, здрави дискуси. Създадено от развъдчици, за развъдчици.',
    'footer.shop': 'Магазин',
    'footer.allFoods': 'Всички храни',
    'footer.bestSellers': 'Най-продавани',
    'footer.support': 'Поддръжка',
    'footer.whyUs': 'Защо нас',
    'footer.contact': 'Контакт',
    'footer.rights': 'Всички права запазени.',

    // Cart drawer
    'cart.title': 'Вашата количка',
    'cart.close': 'Затваряне на количката',
    'cart.empty': 'Количката ви е празна',
    'cart.emptyHint': 'Добавете малко храна, за да поддържате дискусите си щастливи.',
    'cart.remove': 'Премахни',
    'cart.clear': 'Изчисти количката',
    'cart.subtotal': 'Междинна сума',
    'cart.checkout': 'Плащане',
    'cart.redirecting': 'Пренасочване…',
    'cart.securePayment': 'Сигурно плащане чрез Stripe',
    'cart.error':
      'Плащането все още не е достъпно — системата за плащания трябва да бъде конфигурирана.',
    'cart.decrease': 'Намали количеството',
    'cart.increase': 'Увеличи количеството',
    'cart.shipping': 'Доставка',
    'cart.shippingFree': 'БЕЗПЛАТНО',
    'cart.shippingProgress': 'Добавете още {amount} за безплатна доставка',
    'cart.shippingUnlocked': '🎉 Отключихте безплатна доставка!',
    'cart.total': 'Общо',

    // Auth
    'auth.login': 'Вход',
    'auth.signup': 'Регистрация',
    'auth.logout': 'Изход',
    'auth.loginTitle': 'Добре дошли отново',
    'auth.signupTitle': 'Създайте своя акаунт',
    'auth.changePasswordTitle': 'Смяна на парола',
    'auth.resetPasswordTitle': 'Нулиране на парола',
    'auth.username': 'Потребителско име',
    'auth.email': 'Имейл',
    'auth.password': 'Парола',
    'auth.oldPassword': 'Стара парола',
    'auth.newPassword': 'Нова парола',
    'auth.passwordHint': 'Поне 6 символа',
    'auth.confirmPassword': 'Потвърдете паролата',
    'auth.confirmNewPassword': 'Потвърдете новата парола',
    'auth.createAccount': 'Създай акаунт',
    'auth.changePassword': 'Смяна на парола',
    'auth.resetPassword': 'Нулиране на парола',
    'auth.backToLogin': 'Назад към вход',
    'auth.done': 'Готово',
    'auth.haveAccount': 'Вече имате акаунт?',
    'auth.noAccount': 'Нямате акаунт?',
    'auth.close': 'Затвори',
    'auth.adminPanel': 'Админ панел',
    'auth.signingIn': 'Влизане…',
    'auth.creating': 'Създаване…',
    'auth.sendingReset': 'Изпращане…',
    'auth.updatingPassword': 'Обновяване…',
    'auth.errPasswordShort': 'Паролата трябва да е поне 6 символа.',
    'auth.errPasswordMatch': 'Паролите не съвпадат.',
    'auth.errFields': 'Моля, попълнете всички полета.',
    'auth.loginSuccess': 'Влязохте успешно.',
    'auth.signupSuccess': 'Акаунтът е създаден! Вече можете да влезете.',
    'auth.resetSent': 'Изпратен е имейл за нулиране на паролата. Проверете входящата си поща.',
    'auth.passwordUpdated': 'Паролата е обновена.',
    // Account type tabs + business account
    'auth.personalTab': 'Личен акаунт',
    'auth.businessTab': 'Бизнес акаунт',
    'auth.businessSignupTitle': 'Създайте своя бизнес акаунт',
    'auth.accountDetails': 'Данни за акаунта',
    'auth.companyDetails': 'Данни за фирмата',
    'auth.billingAddress': 'Адрес за фактуриране',
    'auth.companyName': 'Юридическо име на фирмата',
    'auth.vatNumber': 'ДДС № / Данъчен номер',
    'auth.registrationNumber': 'ЕИК / Регистрационен номер (по избор)',
    'auth.contactName': 'Лице за контакт',
    'auth.phone': 'Телефонен номер',
    'auth.billingEmail': 'Имейл за фактуриране (по избор)',
    'auth.addressLine1': 'Адрес (ред 1)',
    'auth.addressLine2': 'Адрес (ред 2) (по избор)',
    'auth.city': 'Град',
    'auth.state': 'Област / Регион (по избор)',
    'auth.postalCode': 'Пощенски код',
    'auth.country': 'Държава',
    'auth.createBusinessAccount': 'Създай бизнес акаунт',
  },
} as const
