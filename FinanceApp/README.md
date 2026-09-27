# Finance Management System — Mobile Application (React Native)

[![React Native](https://img.shields.io/badge/React%20Native-0.74+-61DAFB?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript / JavaScript](https://img.shields.io/badge/Language-JavaScript%20%2F%20JSX-F7DF1E?style=flat&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Design System](https://img.shields.io/badge/Design%20System-Fintech%20Premium%20Purple-6B46C1?style=flat)](../Docs/mobileapp.md)

High-performance, offline-capable, fintech-grade mobile application for microfinance administrators, field collection agents, and borrower management. Built with **React Native**, **Redux Toolkit**, and a unified design system.

---

## 📖 Table of Contents
1. [Design Standards & Add User UI Specification](#-design-standards--add-user-ui-specification)
   - [Canvas & Containers](#1-canvas--container-ui)
   - [Typography & Text Tokens](#2-typography--text-tokens)
   - [Spacing, Padding & Layout Rules](#3-spacing-margins--padding-system)
   - [Color Palette & Backgrounds](#4-color-palette--surface-tokens)
   - [Hero Animation Standard](#5-hero-animation-hero-section)
   - [Form Inputs & Label Containers](#6-form-inputs--validation-states)
   - [Selector Chips & Lending Schemes](#7-selector-chips--lending-schemes)
   - [Dynamic Breakdown Card (previewBox)](#8-dynamic-calculation-preview-card)
   - [Primary Action Buttons](#9-primary-action-buttons)
2. [Screen Integration & Replication](#-screen-integration--replication)
3. [Project Architecture](#-project-architecture)
4. [Getting Started & Local Development](#-getting-started--local-development)
5. [Detailed Documentation Links](#-detailed-documentation-links)

---

## 🎨 Design Standards & Add User UI Specification

The **Add User** screen (`AddU.jsx` / `AddUsty.jsx`) and **Borrower Loans & Allotment** modal (`IssueLoanModal.jsx` / `IssueLoanStyles.js`) define the gold standard for all mobile forms, modals, and collection screens in this project.

```
┌─────────────────────────────────────────────────────────┐
│  <Header title="Add User / Allot Loan" />                │
├─────────────────────────────────────────────────────────┤
│  [ Plain Lottie Animation - 160x160 - Zero Border ]    │
├─────────────────────────────────────────────────────────┤
│  [ Scheme / Division Chips: Daily | Weekly | Monthly ]  │
├─────────────────────────────────────────────────────────┤
│  👤 Full Name *                                         │
│  [ TextInput: #F5F5F5, radius 12px, font 16px ]         │
├─────────────────────────────────────────────────────────┤
│  📞 Phone Number *          🎂 Age [ 28 Yrs ]           │
│  [ TextInput ]              [ TextInput ]               │
├─────────────────────────────────────────────────────────┤
│  [ Preset Chips: ₹5,000 | ₹10,000 | ₹25,000 | ₹50,000 ]  │
├─────────────────────────────────────────────────────────┤
│  ┌─ previewBox (#F5F3FF, radius 14px) ────────────────┐ │
│  │ PRINCIPAL   REPAYABLE (Border)    EMI      REVENUE │ │
│  │  ₹10,000         ₹11,000         ₹1,100     +₹1,000│ │
│  └────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  [ 🚀 Primary CTA Button: #6B46C1, radius 14px ]        │
└─────────────────────────────────────────────────────────┘
```

---

### 1. Canvas & Container UI

| Container Element | Style Rules | Description |
| :--- | :--- | :--- |
| **`safeArea`** | `flex: 1, backgroundColor: '#FFFFFF'` | Pure white root canvas ensuring status and navigation bar uniformity. |
| **`container`** | `flex: 1, backgroundColor: '#FFFFFF'` | Main container wrapper. |
| **`scrollContainer`** | `flex: 1, backgroundColor: '#FFFFFF'` | ScrollView canvas. |
| **`scrollContent`** | `paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 44 : 32` | Standard breathing space for scrollable forms with OS-aware bottom safe-insets. |
| **`formSection`** | `marginBottom: 20` | Grouping container for logical blocks of inputs. |
| **`rowTwoInputs`** | `flexDirection: 'row', gap: 12` | Grid container for side-by-side inputs (e.g. Phone + Age or Tenure + Unit). |

---

### 2. Typography & Text Tokens

Fonts are strictly loaded using **`Gilroy-Bold`** / **`Poppins-Bold`** for headings/inputs and **`Gilroy-Regular`** / **`Poppins-Regular`** for helper/error text across Android and iOS.

| Role | Font Family (Android / iOS) | Size | Weight / Color | Example Use |
| :--- | :--- | :--- | :--- | :--- |
| **Header Title** | `Gilroy-Bold` / `Poppins-Bold` | `18px` | `#111827` (Charcoal) | Top Navigation Header |
| **Section Heading** | `Gilroy-Bold` / `Poppins-Bold` | `15px` – `16px` | `#212121` | Scheme / User Details title |
| **Field Label** | `Gilroy-Bold` / `Poppins-Bold` | `15px` | `#212121` | Form input labels |
| **Required Star** | System Bold | `14px` | `#EF4444` (Red-500) | Mandatory field indicator |
| **Input Text** | `Gilroy-Bold` / `Poppins-Bold` | `16px` | `#212121` | Active user typing in form |
| **Placeholder** | `Gilroy-Bold` / `Poppins-Bold` | `16px` | `#A0A0A0` / `#9CA3AF` | Inactive input hints |
| **Error Text** | `Gilroy-Regular` / `Poppins-Regular`| `12px` | `#EF4444` | Form validation feedback |
| **Chip Title** | `Gilroy-Bold` / `Poppins-Bold` | `12px` | `#334155` / `#6B46C1` | Lending scheme title |
| **Chip Subtitle** | `Gilroy-Bold` / `Poppins-Bold` | `11px` | `#059669` (Green-600) | Scheme rate / tenure hint |
| **Preview Label** | `Gilroy-Bold` / `Poppins-Bold` | `10px` | `#64748B` (Slate-500) | `PRINCIPAL`, `REPAYABLE`, `EMI` |
| **Preview Value** | `Gilroy-Bold` / `Poppins-Bold` | `13px` | `#212121` / `#6B46C1` | Numeric figures in breakdown |
| **CTA Button Text** | `Gilroy-Bold` / `Poppins-Bold` | `16px` | `#FFFFFF` | Primary submit button text |

---

### 3. Spacing, Margins & Padding System

Standard spacing tokens prevent visual clutter and ensure effortless touch targets:

- **Screen Horizontal Inset**: `20px` (`paddingHorizontal: 20`)
- **Input Field Separation**: `18px` (`marginBottom: 18`)
- **Label to Input Field**: `8px` (`marginBottom: 8`)
- **Icon to Label Text**: `8px` (`gap: 8`)
- **Two-Column Input Gap**: `12px` (`gap: 12`)
- **Section Bottom Spacing**: `20px` (`marginBottom: 20`)
- **Preset Quick Chips Gap**: `8px` (`gap: 8`, `marginTop: 10`)
- **Button Padding**: `paddingVertical: 16`
- **Button Bottom Offset**: `20px` (Android) / `28px` (iOS)

---

### 4. Color Palette & Surface Tokens

| Token Name | Hex Code | Usage / Context |
| :--- | :--- | :--- |
| **`Primary Brand`** | `#6B46C1` | Primary CTA buttons, active chip borders, active text, icons |
| **`Brand Soft Fill`** | `#F5F3FF` | Active chip background, `previewBox` calculation container fill |
| **`Brand Soft Border`**| `#DDD6FE` | Border for calculation `previewBox` |
| **`Canvas White`** | `#FFFFFF` | Safe area, screen backgrounds, preview tile cards |
| **`Input Fill`** | `#F5F5F5` | Neutral form input background |
| **`Chip Subtle Fill`** | `#F8FAFC` | Unselected chip background, toggle card background |
| **`Chip Border`** | `#E2E8F0` | Unselected chip border line |
| **`Text Main`** | `#212121` | Headings, labels, and active input values |
| **`Text Muted`** | `#64748B` / `#6B7280` | Subtitles, label icons, preview metric labels |
| **`Success Green`** | `#059669` | Positive profit/revenue, interest rate badges, active loan status |
| **`Danger / Error`** | `#EF4444` | Required asterisks, input error borders, validation errors |
| **`Error Soft Fill`** | `#FEF2F2` | Background fill when an input has validation error |

---

### 5. Hero Animation (Hero Section)

To keep modern forms sleek, hero Lottie animations are displayed **plain and borderless** without an enclosing box:

```javascript
animationContainer: {
  alignItems: 'center',
  marginTop: -6,      // Tightened spacing
  marginBottom: 10,   // Balanced spacing
},
animation: {
  width: 160,
  height: 160,
}
```

---

### 6. Form Inputs & Validation States

```jsx
<View style={styles.inputContainer}>
  <View style={styles.labelContainer}>
    <View style={styles.labelLeft}>
      <MaterialCommunityIcons name="account" size={16} color="#6B7280" />
      <Text style={styles.inputLabel}>Full Name</Text>
      <Text style={styles.requiredStar}>*</Text>
    </View>
  </View>
  <TextInput
    style={[styles.textInput, errors.name && styles.inputError]}
    placeholder="Enter borrower full name"
    placeholderTextColor="#A0A0A0"
    value={formData.name}
    onChangeText={(text) => handleFieldChange('name', text)}
  />
  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
</View>
```

**Input Style Definition (`styles.textInput`)**:
- `backgroundColor: '#F5F5F5'`
- `borderRadius: 12`
- `paddingHorizontal: 16`
- `paddingVertical: 14`
- `fontSize: 16`
- `color: '#212121'`
- `fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold'`
- `borderWidth: 1`
- `borderColor: 'transparent'`

---

### 7. Selector Chips & Lending Schemes

Used for choosing lending schemes (Daily, Weekly, Monthly) and funding accounts (Cash, Bank, Wallet):

```javascript
divisionChip: {
  flex: 1,
  backgroundColor: '#F8FAFC',
  borderRadius: 14,
  borderWidth: 1.5,
  borderColor: '#E2E8F0',
  paddingVertical: 12,
  paddingHorizontal: 6,
  alignItems: 'center',
  justifyContent: 'center',
},
divisionChipSelected: {
  backgroundColor: '#F5F3FF',
  borderColor: '#6B46C1',
},
```

---

### 8. Dynamic Calculation Preview Card (`previewBox`)

Four-tile responsive matrix calculating immediate loan parameters:

```jsx
<View style={styles.previewBox}>
  <View style={styles.previewHeader}>
    <MaterialCommunityIcons name="calculator" size={18} color="#6B46C1" />
    <Text style={styles.previewTitle}>Repayment & Revenue Breakdown</Text>
  </View>

  <View style={styles.previewGrid}>
    <View style={styles.previewItem}>
      <Text style={styles.previewLabel}>PRINCIPAL</Text>
      <Text style={styles.previewValue}>₹10,000</Text>
    </View>

    <View style={[styles.previewItem, styles.previewHighlight]}>
      <Text style={styles.previewLabel}>REPAYABLE</Text>
      <Text style={styles.previewValueHighlight}>₹11,000</Text>
    </View>

    <View style={styles.previewItem}>
      <Text style={styles.previewLabel}>EMI</Text>
      <Text style={[styles.previewItemValue, { color: '#059669' }]}>₹1,100</Text>
    </View>

    <View style={styles.previewItem}>
      <Text style={styles.previewLabel}>REVENUE</Text>
      <Text style={[styles.previewItemValue, { color: '#059669' }]}>+₹1,000</Text>
    </View>
  </View>
</View>
```

---

### 9. Primary Action Buttons

```javascript
createButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#6B46C1',
  borderRadius: 14,
  paddingVertical: 16,
  gap: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 4,
  elevation: 4,
},
createButtonDisabled: {
  opacity: 0.6,
},
createButtonText: {
  fontSize: 16,
  color: '#FFFFFF',
  fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
}
```

---

## 📱 Screen Integration & Replication

The design system established above is strictly implemented across the following screens:

1. **Add User Screen** (`src/pages/Admin/Modals/page/AddUser/AddU.jsx`)
2. **Borrower Loans & Allotment** (`src/pages/Admin/pages/IssueLoan/IssueLoanModal.jsx`)
3. **Financial Reports & Dues Directory** (`src/pages/Admin/pages/Reports/Reports.jsx`)
4. **Borrower Settlement & Ledger Logs Modal** (`src/pages/Admin/pages/Reports/BorrowerLogModal.jsx`)
5. **SuperAdmin Executive Reports** (`src/pages/superadmin/SuperAdminReports.jsx`)
6. **Borrower Directory** (`src/pages/Admin/pages/Customers/CustomersScreen.jsx`)

---

## 🛠 Project Architecture

```
FinanceApp/
├── App.jsx                       # Root Application component & Providers
├── index.js                      # React Native entry point
├── src/
│   ├── components/
│   │   └── Header/               # Standardized Top Bar Header Component
│   ├── pages/
│   │   └── Admin/
│   │       ├── Modals/page/
│   │       │   └── AddUser/      # Add User Page (AddU.jsx, AddUsty.jsx)
│   │       └── pages/
│   │           └── IssueLoan/    # Borrower Loans & Allotment (IssueLoanModal.jsx)
│   ├── theme/
│   │   ├── colors.js             # Central Theme Color Definitions
│   │   └── typography.js         # Typography & Font Loaders
│   └── store/                    # Redux Toolkit Slices & API Sync
```

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- Node.js `v18+`
- Android Studio & Android SDK (with Platform 34+)
- React Native CLI / Metro Bundler

### 2. Installation
```bash
cd FinanceApp
npm install
```

### 3. Run Android Emulator / Physical Device
```bash
npm run android
```

### 4. Run Metro Bundler Standalone
```bash
npm start
```

---

## 📚 Detailed Documentation Links

- [Complete Mobile Application Guide & Design Specs](../Docs/mobileapp.md)
- [Professional Theme, Typography & Web Standards](../Docs/ProfesonalTheme&Content.md)
