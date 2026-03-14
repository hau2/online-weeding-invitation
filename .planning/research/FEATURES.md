# Feature Research

**Domain:** Vietnamese Online Wedding Invitation SaaS (Thiệp Cưới Online)
**Researched:** 2026-03-14
**Confidence:** HIGH (core features) / MEDIUM (Vietnam-specific nuances)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete. These are validated
across Joy, Zola, Paperless Post, The Simple (thesimple.vn), and Vietnamese market norms.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Invitation editor (names, date, venue, message) | Minimum viable wedding invitation — no editor = no product | LOW | Form-based, real-time preview, Vietnamese font support essential |
| Template selection (3+ designs) | Couples expect aesthetic choice; single template feels like a demo | LOW | Vietnamese styles: Traditional (red/gold/dragon/phoenix), Modern, Minimalist; cover all common tastes |
| Photo gallery | Every wedding invitation shows couple photos; absence is jarring | MEDIUM | Drag-drop upload, auto-optimization for mobile bandwidth; 3G/4G Vietnam networks |
| Public shareable URL (`/w/{slug}`) | Digital invitation must have a link to share via Zalo/Facebook | LOW | Slug must be readable/memorable, not random hash |
| QR code for invitation URL | Vietnamese couples share invitations by printing/displaying QR; it's the primary sharing unit | LOW | Fixed QR per wedding; must remain stable even after edits |
| Mobile-first responsive design | ~90% of Vietnamese guests open links on phone, including elderly relatives | MEDIUM | 320px minimum width; large tap targets; readable without zoom |
| Fast loading on 3G/4G | Guests in rural Vietnam or on weak signals must open it | HIGH | Page weight <1MB; lazy-load images; no blocking JS; critical path CSS inlined |
| Vietnamese-language UI | Users are Vietnamese; English UI creates friction and abandonment | LOW | 100% tiếng Việt; no i18n complexity needed for v1 |
| Background music | Standard on Vietnamese digital invitations — absence feels cheap | MEDIUM | Upload or library; explicit play/pause toggle mandatory (autoplay blocked by browsers); loop |
| Wedding date countdown | Users expect this as a "wow" live element on the invitation page | LOW | Client-side JS countdown; simple display |
| Venue/location display | Guests need to know where to go | LOW | Text fields sufficient; Google Maps embed or link is a plus |
| Publish/unpublish control | Couple must be able to hide invitation before it's ready | LOW | Simple toggle; unpublished = 404 for guests |
| Auto-expire after wedding | Guests shouldn't see an active invitation months after the wedding | LOW | Configurable grace period; admin sets defaults |
| User account (register/login) | Required to save and manage invitations | LOW | Email + phone + password; sufficient for Vietnam market |
| Dashboard to manage invitations | Users need to see, edit, and revisit their invitation | LOW | List view, status, QR access, edit link |
| Free tier with watermark | Market standard — lets users evaluate before paying | LOW | Watermark on public page; all core features available to validate |
| Premium tier without watermark | Revenue model; couples paying for a wedding will pay to remove a logo | LOW | Plus more templates, more photos, no branding |

### Differentiators (Competitive Advantage)

Features that set this product apart from global platforms (Joy, Zola) that ignore the
Vietnamese market, and from local providers (thesimple.vn) that lack self-service SaaS.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Bank QR image display (wedding gift money) | VietQR/NAPAS bank transfers are how Vietnamese guests send gift money; no other self-service platform integrates this natively | LOW | Upload couple's own QR image (from banking app); platform does NOT generate or process payments; display-only |
| Rich envelope opening animation | "Wow factor" on first open — envelope reveal with particles, falling petals, transitions is culturally resonant and memorable; differentiates from plain HTML invitations | HIGH | CSS/canvas animations; must be performant on mid-range Android phones; skip option for elderly users |
| Guest name personalization via URL param (`?to=Tên`) | Couple can send "Dear Chú Năm" vs "Dear Bạn Minh" from the same invitation by sharing different links; deeply personal; fits Vietnamese hierarchical address culture | LOW | Query param injected into greeting text; couple manages different links per guest group in Zalo |
| Zalo-optimized link preview (OG tags) | Zalo is the primary sharing channel in Vietnam (79M MAU); well-formed OG title/description/image makes links look beautiful in Zalo chat vs bare URLs | LOW | Server-side rendered OG meta tags; couple photo as OG image; invitation title as OG title |
| Self-service, no-support model | Vietnamese local competitors (thesimple.vn) require manual ordering and communication; this platform is fully self-service — create at midnight, publish immediately | MEDIUM | Solid editor UX, clear onboarding, helpful empty states |
| System music library | Couples who don't have a music file shouldn't be blocked; a curated library of 10-20 pre-cleared wedding songs removes friction | MEDIUM | Admin uploads MP3s; couples choose from list or upload own; inactive library music still plays on existing invitations |
| 3 template styles tuned to Vietnamese aesthetics | Global platforms offer generic Western templates; Traditional/Modern/Minimalist tuned to Vietnamese color palettes and motifs (lotus, red/gold, clean serif) resonate locally | HIGH | Requires design investment; templates are code (not images) for dynamic rendering |
| Admin-controlled platform payment via QR | No payment gateway integration cost or complexity; admin displays own bank QR; users scan and pay; admin manually grants Premium — valid for early-stage Vietnam market where trust in manual payment exists | LOW | Admin panel section; transaction log; manual approval workflow |
| Invitation expiry grace period tuning | Admin can configure expiry buffer (e.g., 7 days after wedding date) — balances clean system vs guests who arrive late to view | LOW | System setting in admin panel |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. Explicitly not building these in v1.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time guest chat / comments | "Let guests congratulate us" | Requires moderation, spam handling, WebSocket infrastructure; not core to sending an invitation | Guest can congratulate via Zalo/Facebook after receiving the link |
| RSVP / attendance tracking | "Know who's coming" | Adds complex guest list management, confirmation emails, follow-up logic; out of scope for pure invitation platform v1; Joy/Zola do this well for western market but Vietnamese weddings rely on phone calls | Defer to v1.x; couples currently call guests by phone, which is culturally normal |
| Generate bank QR from account details | "Make it easier to add bank QR" | VietQR generation requires bank API integration, account validation, security surface; complex for v1 | Couples upload their own QR image from their banking app (MBBank, VCB, etc.) — they already have it |
| OAuth login (Google, Facebook, Zalo) | "Faster signup" | Adds OAuth dependency, scopes, token refresh complexity; Vietnamese couples expect email/phone login; Zalo OAuth is particularly complex | Email + phone + password is sufficient; social login can be added in v2 |
| Video uploads / video invitation | "Modern, viral format" | Bandwidth and storage costs are disproportionate for a gift QR display platform; video encoding infrastructure needed | Photo gallery is sufficient; couples can link YouTube/TikTok externally if needed |
| Per-guest QR codes (unique QR per person) | "Track who scanned" | One fixed QR is the product promise; per-guest QR needs generation pipeline, guest list management, analytics; massive scope increase | Use `?to=Name` URL param for personalization; one fixed QR for sharing |
| Native mobile app | "Better UX on phone" | Doubles development surface; App Store / Google Play release cycle; web-first is sufficient for Vietnamese usage patterns | Mobile-first responsive web; PWA if offline is needed later |
| Online payment gateway (VNPay, Momo, Stripe) | "Automated Premium upgrade" | Payment gateway integration = compliance, webhooks, refund handling, security audit; admin manual grant is sufficient for v1 scale | Admin bank QR + manual grant; gateway in v2 when volume justifies it |
| Admin editing invitation content | "Fix mistakes for users" | Creates liability (admin altered my content?), trust issues, GDPR-equivalent concerns; user is single source of truth | Admin can disable/enable but never modify; user edits their own content |
| Invitation analytics (view counts, open rates) | "See how many people opened it" | Adds tracking infrastructure, privacy considerations, storage; vanity metric for couples | Not needed for core value; defer to v2 if users ask consistently |
| Multi-event invitations (tea ceremony + wedding banquet) | "We have two events" | Complex scheduling UI, per-event RSVP, multi-venue display; Joy has this but it's a full platform feature | Single-event invitation covers the wedding banquet (main event); tea ceremony is family-only, handled separately |
| Registry / gift wishlist integration | "Guests can buy us gifts" | Western feature; Vietnamese gift culture is cash via bank transfer, not registry shopping | Bank QR display covers the Vietnamese gift-giving flow entirely |

---

## Feature Dependencies

```
[User Auth / Account]
    └──requires──> [Dashboard]
                       └──requires──> [Invitation Editor]
                                          └──requires──> [Template System]
                                          └──requires──> [Photo Upload]
                                          └──requires──> [Music Config]
                                          └──requires──> [Bank QR Upload]
                                          └──enhances──> [Guest Name Personalization (?to=)]
                       └──requires──> [Publish / Unpublish]
                                          └──generates──> [Public URL /w/{slug}]
                                                              └──generates──> [Invitation QR Code]
                                                              └──serves──> [Public Invitation Page]

[Public Invitation Page]
    └──requires──> [Template System] (renders the page)
    └──requires──> [Envelope Opening Animation] (first interaction)
    └──requires──> [Background Music Player]
    └──requires──> [Bank QR Image Display]
    └──enhances──> [Guest Name Personalization (?to=)]
    └──enhances──> [Wedding Date Countdown]
    └──enhances──> [Zalo OG Tags] (link preview quality)

[Template System]
    └──requires──> [Template Metadata] (admin-managed)
    └──conflicts──> [Admin Editing Content] (templates render user data, never admin-modified)

[Auto-Expire]
    └──requires──> [Wedding Date] (from invitation editor)
    └──requires──> [Expiry Settings] (admin system settings)

[Premium Tier]
    └──requires──> [Pricing Plan Config] (admin service plans)
    └──requires──> [Manual Payment Flow] (admin payment tracking)
    └──unlocks──> [More Templates]
    └──unlocks──> [More Photos]
    └──unlocks──> [No Watermark]

[Admin Panel]
    └──requires──> [Admin Auth] (separate from user auth, role-based)
    └──manages──> [System Music Library]
    └──manages──> [Template Metadata]
    └──manages──> [Service Plans / Permissions]
    └──manages──> [Payment Transactions]
    └──manages──> [System Settings] (expiry durations, upload limits, bank list)
    └──moderates──> [Invitations] (enable/disable only, never edit)
```

### Dependency Notes

- **Photo Upload requires Storage**: Supabase Storage handles this; must be configured before upload features work.
- **Envelope Animation requires Public Page**: Animation is the entry point to the public invitation page; cannot exist independently.
- **Music Player requires explicit play/pause**: Browser autoplay policies block audio without user gesture — the envelope-tap interaction counts as the gesture, enabling music to start after the animation completes.
- **Invitation QR requires stable slug**: The slug must never change after publishing — if the couple reprints/reshares the QR, the URL must remain valid. Slug is set at publish time.
- **Guest Name Personalization enhances but does not require editor**: The `?to=Name` feature works client-side at render time; no editor change needed — it reads the query param and renders the greeting.
- **Zalo OG Tags require SSR**: Meta tags must be server-rendered (Next.js SSR/ISR) for Zalo's crawler to pick them up — client-only rendering will produce blank link previews.
- **Premium Tier conflicts with Free Tier watermark**: A user can only be in one tier at a time; the watermark render logic must check the plan at page serve time.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what couples need to create and share a real invitation.

- [x] User registration and login (email/phone + password)
- [x] Invitation editor: names, date, venue, message, thank-you text
- [x] 3 templates: Traditional, Modern, Minimalist
- [x] Photo gallery upload (drag-drop, basic optimization)
- [x] Background music (upload file + system library selection, play/pause toggle)
- [x] Bank QR image upload (display on public page for guest gift transfers)
- [x] Publish/unpublish + fixed public URL `/w/{slug}`
- [x] Invitation QR code generation (for the public URL)
- [x] Rich envelope opening animation (particles/petals on first open)
- [x] Guest name personalization via `?to=Name` URL parameter
- [x] Public page: all invitation details + bank QR + music + countdown
- [x] Zalo/Facebook OG meta tags (server-rendered for proper link preview)
- [x] Mobile-first responsive design, fast on 3G/4G
- [x] Auto-expire invitations (configurable grace period after wedding date)
- [x] Free tier with watermark / Premium tier without watermark + more
- [x] Admin payment via bank QR + manual Premium grant
- [x] Admin panel: users, invitations (view/disable), music library, plans, payments, settings
- [x] Vietnamese-only UI

### Add After Validation (v1.x)

Features to add once the core is working and couples are using it.

- [ ] RSVP / attendance confirmation — add when couples explicitly request it and phone-based tracking proves insufficient
- [ ] More templates (5-10 total) — add when couples request styles not covered by initial 3
- [ ] Invitation analytics (view count) — add when couples ask "is anyone opening this?"
- [ ] Bulk guest link generator (pre-fill `?to=Name` for a list) — add when couples complain about manually creating personalized links

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Online payment gateway (VNPay, MoMo) — defer until manual payment becomes a bottleneck
- [ ] OAuth login (Zalo, Google) — defer until signup friction is proven to be causing churn
- [ ] RSVP with guest list management — requires full platform expansion; consider separate product tier
- [ ] Per-guest unique links with tracking — requires analytics infrastructure
- [ ] Native mobile app (PWA first, then native) — defer until web usage data justifies
- [ ] Video invite option — defer until bandwidth costs are understood

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Invitation editor + templates | HIGH | LOW | P1 |
| Public URL + QR code | HIGH | LOW | P1 |
| Envelope opening animation | HIGH | HIGH | P1 |
| Bank QR display | HIGH | LOW | P1 |
| Photo gallery | HIGH | MEDIUM | P1 |
| Background music | HIGH | MEDIUM | P1 |
| Mobile-first + 3G performance | HIGH | MEDIUM | P1 |
| Guest name `?to=` personalization | HIGH | LOW | P1 |
| Zalo OG meta tags | HIGH | LOW | P1 |
| Free/Premium tiers + watermark | HIGH | LOW | P1 |
| Admin panel | HIGH | MEDIUM | P1 |
| Auto-expire | MEDIUM | LOW | P1 |
| Countdown timer | MEDIUM | LOW | P1 |
| RSVP system | MEDIUM | HIGH | P3 |
| More templates | MEDIUM | HIGH | P2 |
| Analytics | LOW | MEDIUM | P3 |
| Bulk guest link generator | MEDIUM | LOW | P2 |
| OAuth login | LOW | MEDIUM | P3 |
| Payment gateway | HIGH | HIGH | P2 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Joy (withjoy.com) | Paperless Post | thesimple.vn | Our Approach |
|---------|-------------------|----------------|--------------|--------------|
| Template styles | 100+ Western designs | 50+ Western designs | ~10 Vietnamese designs (manual order) | 3 Vietnamese-tuned templates, self-service |
| RSVP | Full guest list management | Basic RSVP tracking | Manual (not self-service) | Defer v1; phone-based is culturally normal in Vietnam |
| Background music | No (not a feature) | No | Yes (on some templates) | Yes — system library + upload |
| Bank QR / gift money | No (registry links only) | No | No self-service | Yes — upload own QR image, display on public page |
| Sharing channel | Email, link | Email, link | WhatsApp | Zalo-first (OG tags, QR) + any messaging link |
| Guest name personalization | Advanced (per-guest page permissions) | No | No | `?to=Name` URL param, simple and effective |
| Envelope animation | No | No | Yes (some templates) | Yes — signature rich animation, differentiator |
| Pricing model | Free (custom domain $19.99/yr) | Credits / subscription | Manual order pricing | Free (watermark) / Premium (manual payment grant) |
| Vietnam-specific features | None | None | Limited self-service | VietQR display, Zalo OG, Vietnamese templates, tiếng Việt UI |
| Self-service | Full | Full | No (manual ordering) | Full self-service |
| Performance target | No specific target | No specific target | Not stated | <1MB, <2s FMP on 4G |

---

## Vietnamese Market Specifics

### Cultural Nuances That Affect Feature Design

**Bank QR cultural sensitivity:** There is genuine cultural debate in Vietnam about bank QR codes on wedding invitations ("Văn minh hay đòi nợ?" — "Civilized or demanding repayment?"). The correct UX approach: display the bank QR tastefully on the invitation page (not aggressively in the header), with a soft label like "Mừng cưới" (wedding gift). The couple opts in by uploading — it is not mandatory. This matches how the physical-invitation trend is evolving: QR at the bottom of invitations, not the headline.

**Elderly guests:** Many Vietnamese couples send physical printed cards to elderly relatives and digital links to younger guests. The public page must handle non-tech-savvy users: large text, clear hierarchy, no confusing interactive elements beyond the envelope open. The envelope animation should have a clear tap/click affordance — not just appear static.

**Zalo is primary sharing channel:** Zalo has 79M monthly active users in Vietnam, more than Facebook Messenger for personal communication. Every invitation URL will primarily be shared via Zalo. OG tag optimization for Zalo's link crawler is therefore a table stakes feature disguised as a technical detail.

**VietQR ubiquity:** Every major Vietnamese bank participates in VietQR/NAPAS. Guests use MBBank, Vietcombank, VPBank, TPBank etc. mobile apps to scan and transfer. The couple's bank QR image (generated by their banking app) is universally scannable. Uploading an image is the right approach — no API integration needed.

**Tea ceremony vs. wedding banquet:** Vietnamese weddings have two main events: the tea ceremony (lễ ăn hỏi, family only) and the wedding banquet (đám cưới, all guests). The invitation platform targets the banquet invitation, which is the socially shared event. Tea ceremony invitations are delivered personally — not the platform's use case.

---

## Sources

- [Joy Wedding Websites](https://withjoy.com/wedding-website/) — feature set analysis
- [Zola Wedding Websites](https://www.zola.com/wedding-planning/website) — RSVP, registry, templates
- [Paperless Post Wedding Invitations](https://www.paperlesspost.com/wedding) — design, customization, guest management
- [Guesticon: Zola vs Joy vs The Knot vs Guesticon 2025](https://guesticon.com/blog/zola-vs-joy-vs-the-knot-wedding-website-comparison-2025) — comparison
- [The Simple (thesimple.vn)](https://thesimple.vn/en-us) — Vietnamese competitor, local market features
- [VnExpress: Bank QR on wedding invitations debate](https://vnexpress.net/nhan-thiep-cuoi-in-ma-qr-tai-khoan-ngan-hang-4701357.html) — cultural context
- [VnExpress International: Bank QR cultural sensitivity](https://e.vnexpress.net/news/love/bank-qr-codes-on-wedding-invitations-imply-a-debt-repayment-expectation-4708491.html) — "debt repayment" framing
- [Zalo statistics 2025](https://www.salesmartly.com/en/blog/docs/what-is-zalo) — 79M MAU, primary Vietnam messaging app
- [VietQR payment standard](https://docs.paymentwall.com/payment-method/vietqr) — NAPAS standard, bank QR ecosystem
- [Vietnam Lucky Money QR Code trend 2026](https://www.vietnam.vn/en/xu-huong-li-xi-so-qua-qr-code-tiep-tuc-no-ro-trong-dip-tet-binh-ngo-2026) — QR for gift money is mainstream in Vietnam
- [OneLove Vietnam wedding platform](https://blink.new/p/onelove-vietnam-wedding-platform-ddw4z1t0) — Vietnamese-market competitor reference (Zalo integration, VietQR, bilingual)
- [Vietnamese wedding invitation customs](https://party.alibaba.com/asset/vietnamese-wedding-invitation) — cultural norms, elderly handling, hybrid approach

---

*Feature research for: Vietnamese Online Wedding Invitation SaaS*
*Researched: 2026-03-14*
