# Chakra UI to Shadcn/UI Migration Plan

## Executive Summary

This document outlines the complete migration strategy from Chakra UI to Shadcn/UI for the Minerva frontend application. The migration will modernize the component library, improve TypeScript integration, enhance customization capabilities, and align with current React ecosystem best practices.

## Current State Analysis

### Chakra UI Dependencies
```json
"@chakra-ui/icons": "^2.1.1",
"@chakra-ui/next-js": "^2.4.2", 
"@chakra-ui/react": "^2.8.2",
"@emotion/react": "^11.11.3",
"@emotion/styled": "^11.11.0",
"framer-motion": "^11.0.5"
```

### Component Usage Inventory

**Core Components Currently Used:**
- `Box` - Layout container (used extensively)
- `Flex` - Flexbox container  
- `Text` - Typography component
- `Heading` - Heading typography
- `Button` - Interactive buttons
- `Input` - Form inputs
- `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td` - Data tables
- `Modal`, `ModalOverlay`, `ModalContent` - Modal dialogs
- `Drawer` - Side panel component
- `IconButton` - Button with icon
- `Tooltip` - Hover tooltips
- `useColorMode`, `useColorModeValue` - Theme management
- `ChakraProvider` - Context provider

**Theme Configuration:**
- Custom color palette with primary brand colors
- Custom font configuration (Lora font family)
- Dark/light mode support
- Component style overrides
- Global styles

**Affected Files (19 files total):**
- `app/providers.tsx` - Main theme provider
- `app/layout.tsx`, `app/page.tsx` - Layout files
- `components/*.tsx` - All component files use Chakra UI

## Migration Strategy

### Phase 1: Foundation Setup (Week 1)

#### 1.1 Install Shadcn/UI Dependencies
```bash
# Core dependencies
npm install @radix-ui/react-slot class-variance-authority clsx tailwindcss-animate
npm install tailwindcss postcss autoprefixer
npm install @tailwindcss/typography
npm install lucide-react # For icons

# Dev dependencies  
npm install -D @types/node
```

#### 1.2 Configure Tailwind CSS
- Initialize Tailwind configuration
- Set up PostCSS configuration
- Configure design tokens (colors, typography, spacing)
- Set up dark mode support

#### 1.3 Initialize Shadcn/UI
```bash
npx shadcn-ui@latest init
```

#### 1.4 Install Core Shadcn/UI Components
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add form
```

### Phase 2: Component Mapping & Setup (Week 1-2)

#### 2.1 Component Mapping Strategy

| Chakra UI Component | Shadcn/UI Replacement | Migration Notes |
|---------------------|------------------------|-----------------|
| `Box` | `div` with Tailwind classes | Direct replacement with utility classes |
| `Flex` | `div` with `flex` classes | Use Tailwind flexbox utilities |
| `Text` | `<p>` or `<span>` with typography classes | Custom typography component |
| `Heading` | `<h1>-<h6>` with heading classes | Custom heading component |
| `Button` | `Button` component | Direct replacement |
| `Input` | `Input` component | Direct replacement |
| `Table/Thead/Tbody/Tr/Th/Td` | `Table` component | Direct replacement |
| `Modal` | `Dialog` component | Functionality equivalent |
| `Drawer` | `Sheet` component | Side panel equivalent |
| `IconButton` | `Button` with icon | Size variant of Button |
| `Tooltip` | `Tooltip` component | Direct replacement |
| `useColorMode` | `next-themes` useTheme | Theme management |

#### 2.2 Create Custom Components

**Typography Components:**
```typescript
// components/ui/typography.tsx
interface TypographyProps {
  children: React.ReactNode
  className?: string
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'small' | 'large'
}
```

**Layout Components:**
```typescript  
// components/ui/layout.tsx
interface BoxProps {
  children: React.ReactNode
  className?: string
}
```

#### 2.3 Configure Theme System

**Design Tokens Configuration:**
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f9e9e4',
          100: '#f3d3c9', 
          200: '#e7a793',
          300: '#db7b5d',
          400: '#cf4f27',
          500: '#c96442', // Brand primary
          600: '#a14f35',
          700: '#793b28', 
          800: '#51271b',
          900: '#28130d',
        },
        background: '#fefffa', // Custom background
        foreground: '#171717', // Dark mode background
      },
      fontFamily: {
        sans: ['Lora', 'serif'], // Custom font
      }
    }
  }
}
```

### Phase 3: Component Migration (Week 2-3)

#### 3.1 Migration Priority Order

1. **Layout & Provider Components** (Day 1-2)
   - `app/providers.tsx` → Theme provider setup
   - `app/layout.tsx` → Root layout migration
   - `components/Header.tsx` → Header component

2. **Core UI Components** (Day 3-5)
   - `components/ThemeToggle.tsx` → Theme switcher
   - `components/Subtitle.tsx` → Typography component
   - `components/SearchWrapper.tsx` → Search input

3. **Form Components** (Day 6-8)  
   - `components/AddBookDrawer.tsx` → Form drawer
   - `components/EditBookDrawer.tsx` → Edit form
   - `components/EditBookModal.tsx` → Edit modal

4. **Data Display Components** (Day 9-12)
   - `components/BookTable.tsx` → Data table
   - `components/TableControls.tsx` → Table controls
   - `components/PaginationControls.tsx` → Pagination

5. **Complex Components** (Day 13-15)
   - `components/BookDetailsDrawer.tsx` → Detail view
   - `components/NewsletterModal.tsx` → Modal dialog

#### 3.2 Component-by-Component Migration Guide

**Example: BookTable Component**

*Before (Chakra UI):*
```typescript
import {
  Table, Thead, Tbody, Tr, Th, Td, Box, IconButton, Tooltip
} from '@chakra-ui/react';

export default function BookTable({ books }: BookTableProps) {
  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Title</Th>
          </Tr>
        </Thead>
      </Table>
    </Box>
  );
}
```

*After (Shadcn/UI):*
```typescript
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function BookTable({ books }: BookTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    </div>
  );
}
```

### Phase 4: Theme & Styling Integration (Week 3-4)

#### 4.1 Dark Mode Implementation
```typescript
// app/providers.tsx
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

#### 4.2 Custom CSS Variables
```css
/* globals.css */
@layer base {
  :root {
    --primary: 16 71% 55%; /* #c96442 */
    --primary-foreground: 0 0% 100%;
    --background: 60 54% 98%; /* #fefffa */
    --foreground: 0 0% 9%; /* #171717 */
  }
  
  .dark {
    --background: 0 0% 9%; /* #171717 */
    --foreground: 60 54% 98%; /* #fefffa */
  }
}
```

#### 4.3 Component Styling Consistency
- Establish consistent spacing scale
- Define typography hierarchy
- Create reusable utility classes
- Ensure responsive design patterns

### Phase 5: Testing & Refinement (Week 4)

#### 5.1 Visual Regression Testing
- Compare before/after screenshots
- Test all responsive breakpoints
- Verify dark/light mode functionality
- Check component interactions

#### 5.2 Functionality Verification
- Form submissions work correctly
- Search functionality maintains performance
- Table sorting and pagination operate
- Modal/drawer behaviors are preserved

#### 5.3 Performance Optimization
- Bundle size comparison
- Runtime performance metrics
- Remove unused Chakra UI dependencies
- Optimize Tailwind CSS output

## Implementation Timeline

### Week 1: Foundation
- **Day 1-2:** Install and configure Shadcn/UI, Tailwind CSS
- **Day 3-4:** Set up component library structure
- **Day 5:** Configure theming system and design tokens

### Week 2: Core Migration  
- **Day 1-2:** Migrate layout and provider components
- **Day 3-4:** Migrate basic UI components (buttons, inputs, typography)
- **Day 5:** Migrate search and navigation components

### Week 3: Complex Components
- **Day 1-2:** Migrate table and data display components
- **Day 3-4:** Migrate form components (drawers, modals)
- **Day 5:** Migrate complex interactive components

### Week 4: Polish & Testing
- **Day 1-2:** Visual consistency pass and responsive testing
- **Day 3-4:** Functionality testing and bug fixes  
- **Day 5:** Performance optimization and cleanup

## Benefits of Migration

### Technical Benefits
- **Better TypeScript Integration:** Shadcn/UI components are built with TypeScript-first approach
- **Reduced Bundle Size:** No CSS-in-JS runtime, smaller bundle
- **Modern Styling:** Utility-first approach with Tailwind CSS
- **Better Performance:** No emotion/styled-components runtime overhead
- **Improved DX:** Better IDE support and autocomplete

### Maintainability Benefits  
- **Component Ownership:** Copy components to your codebase for full control
- **Customization:** Easy to modify components without theme conflicts
- **Future-Proof:** Built on stable foundations (Radix UI primitives)
- **Documentation:** Excellent documentation and examples

### Design System Benefits
- **Consistency:** Better design system implementation
- **Flexibility:** More granular control over styling
- **Scalability:** Easier to scale and maintain design patterns
- **Modern Patterns:** Uses current React and CSS best practices

## Risk Mitigation

### Breaking Changes Risk
- **Mitigation:** Thorough testing at each migration step
- **Fallback:** Keep Chakra UI components until migration is complete
- **Incremental:** Migrate components one at a time

### Design Inconsistency Risk
- **Mitigation:** Create comprehensive design token mapping
- **Quality Control:** Visual regression testing
- **Documentation:** Maintain component usage guidelines

### Development Velocity Risk  
- **Mitigation:** Detailed component mapping and migration guides
- **Training:** Team familiarization with new patterns
- **Support:** Comprehensive documentation and examples

## Success Criteria

### Functional Requirements
- [ ] All existing functionality preserved
- [ ] Visual design maintains brand consistency  
- [ ] Dark/light mode functionality works
- [ ] Responsive behavior on all screen sizes
- [ ] Form validation and submission work correctly

### Performance Requirements
- [ ] Bundle size reduced by at least 20%
- [ ] Page load times maintain or improve
- [ ] Component render performance improves
- [ ] No accessibility regressions

### Developer Experience Requirements  
- [ ] TypeScript errors resolved
- [ ] IDE autocomplete functionality improved
- [ ] Component documentation updated
- [ ] Development workflow maintains efficiency

## Next Steps

1. **Approval:** Get stakeholder approval for migration plan
2. **Environment Setup:** Prepare development environment
3. **Team Coordination:** Brief team members on migration approach
4. **Implementation:** Execute migration following the defined phases
5. **Quality Assurance:** Thorough testing and validation
6. **Deployment:** Deploy migrated components to production

## Conclusion

This migration from Chakra UI to Shadcn/UI will modernize the Minerva frontend with better performance, maintainability, and developer experience. The phased approach ensures minimal disruption while providing clear milestones and deliverables.

The investment in this migration will pay dividends in long-term maintainability, performance, and alignment with modern React ecosystem practices.