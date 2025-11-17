# Resume Storage & Management Plan

## Current State Analysis

### ✅ What's Working

1. **Database Storage**
   - **Table**: `public.resumes` in Supabase
   - **Schema**:
     ```sql
     - id (UUID, Primary Key)
     - user_id (UUID, Foreign Key to auth.users)
     - title (TEXT, optional)
     - template_id (TEXT, optional)
     - resume_data (JSONB) - Stores complete resume data
     - created_at (TIMESTAMP)
     - updated_at (TIMESTAMP)
     ```

2. **Auto-Save Functionality**
   - ✅ Auto-saves after 2 seconds of inactivity
   - ✅ Saves to `resumes` table via `useResumes` hook
   - ✅ Creates new resume on first save, updates existing on subsequent saves
   - ✅ Shows "Resume auto-saved" toast notification

3. **Backend Hook**
   - ✅ `useResumes` hook provides:
     - `resumes` - List of all user's resumes
     - `saveResume()` - Save/update resume
     - `loadResume()` - Load specific resume
     - `deleteResume()` - Delete resume
     - `refetch()` - Refresh resume list

### ❌ What's Missing

1. **No Resume List/Gallery Page**
   - Users cannot see their saved resumes
   - No way to browse or manage multiple resumes

2. **No Resume Selection on Entry**
   - When entering Resume Builder, always starts with blank resume
   - Cannot resume editing an existing resume

3. **No Resume Management**
   - Cannot rename resumes
   - Cannot duplicate resumes
   - Cannot see resume metadata (last edited, template used, etc.)

4. **Limited Auto-Save Feedback**
   - Only shows toast notification
   - No persistent "Last saved" indicator
   - No visual save status

---

## Proposed Solution

### Phase 1: Resume List/Gallery Page (HIGH PRIORITY)

**Location**: New page accessible from dashboard sidebar

**Features**:
1. **Resume Grid View**
   - Display all saved resumes as cards
   - Show thumbnail preview of resume
   - Show resume title, template name, last edited date
   - Show completion status (progress indicator)

2. **Resume Card Actions**
   - **Edit** - Open in Resume Builder
   - **Duplicate** - Create a copy
   - **Delete** - Remove resume (with confirmation)
   - **Rename** - Change resume title
   - **Download** - Export as PDF (if implemented)

3. **Empty State**
   - "Create New Resume" button
   - Helpful message for first-time users

4. **Filtering & Sorting**
   - Sort by: Last edited, Created date, Title
   - Filter by: Template type
   - Search by title

### Phase 2: Resume Selection on Builder Entry (HIGH PRIORITY)

**Flow**:
1. User clicks "Resume Builder" from dashboard
2. **IF** user has existing resumes:
   - Show modal/dialog with:
     - List of existing resumes (with preview)
     - "Create New Resume" button
   - User selects: "Edit Existing" or "Create New"
3. **IF** user has no resumes:
   - Go directly to builder (current behavior)

**Implementation**:
- Add resume selection modal to `ResumeBuilderPage`
- Load selected resume data on entry
- Restore `currentStep` from saved data (optional - could start from beginning)

### Phase 3: Enhanced Auto-Save & Resume Continuity (MEDIUM PRIORITY)

**Improvements**:
1. **Better Save Status**
   - Persistent "Last saved: 2 minutes ago" indicator
   - Visual save status (saving/saved/error)
   - Save button that shows current status

2. **Resume Continuity**
   - Save current step in `resume_data`
   - On resume load, restore to last step
   - Show "Resume where you left off" option

3. **Auto-Save Optimization**
   - Reduce debounce time to 1 second
   - Save on step change
   - Save before page unload

### Phase 4: Resume Management Features (MEDIUM PRIORITY)

1. **Rename Resume**
   - Inline editing in resume list
   - Or modal dialog

2. **Duplicate Resume**
   - Create copy with "Copy of [Title]"
   - Preserve all data and settings

3. **Resume Metadata**
   - Show template used
   - Show completion percentage
   - Show word count
   - Show last edited timestamp

4. **Bulk Actions**
   - Select multiple resumes
   - Bulk delete
   - Bulk export (future)

---

## Database Schema

### Current `resumes` Table
```sql
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  template_id TEXT,
  resume_data JSONB,  -- Complete resume data including layout, sections, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON public.resumes(updated_at DESC);
```

### Proposed Enhancements (Optional)
```sql
-- Add metadata fields for better management
ALTER TABLE public.resumes 
  ADD COLUMN IF NOT EXISTS last_step TEXT,  -- Save current step
  ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
```

---

## Implementation Plan

### Step 1: Create Resume Gallery Page
**File**: `src/dashboard/components/ResumeGalleryPage.tsx`

**Features**:
- Grid layout of resume cards
- Each card shows:
  - Resume preview (thumbnail)
  - Title
  - Template name
  - Last edited date
  - Actions (Edit, Duplicate, Delete, Rename)

### Step 2: Add Resume Selection Modal
**File**: `src/dashboard/components/ResumeSelectionModal.tsx`

**Features**:
- Modal dialog showing list of resumes
- "Create New" button
- "Edit" button for each resume
- Preview thumbnail for each resume

### Step 3: Update Resume Builder Entry Flow
**File**: `src/dashboard/components/ResumeBuilderPage.tsx`

**Changes**:
- Check if user has existing resumes on mount
- Show selection modal if resumes exist
- Load selected resume data
- Restore to appropriate step (optional)

### Step 4: Enhance Auto-Save UI
**File**: `src/dashboard/components/ResumeBuilderPage.tsx`

**Changes**:
- Add persistent save status indicator
- Show "Last saved" timestamp
- Visual save state (saving/saved/error)

### Step 5: Add Resume Management Functions
**File**: `src/hooks/useResumes.ts`

**New Functions**:
- `renameResume(resumeId, newTitle)`
- `duplicateResume(resumeId)`
- `getResumeMetadata(resumeId)` - Returns completion %, word count, etc.

---

## User Flow Examples

### Flow 1: First Time User
1. User clicks "Resume Builder"
2. No existing resumes → Go directly to builder
3. User fills in data
4. Auto-saves after 2 seconds
5. User can continue editing or exit
6. Next time: User sees resume selection modal

### Flow 2: Returning User with One Resume
1. User clicks "Resume Builder"
2. Modal shows: "Edit [Resume Title]" or "Create New"
3. User selects "Edit"
4. Resume loads with all data
5. User continues from where they left off

### Flow 3: Returning User with Multiple Resumes
1. User clicks "Resume Builder"
2. Modal shows list of all resumes
3. User selects one to edit OR clicks "Create New"
4. Selected resume loads
5. User can manage resumes from gallery page

### Flow 4: Resume Management
1. User goes to "My Resumes" page (new)
2. Sees grid of all resumes
3. Can:
   - Click to edit
   - Rename inline
   - Duplicate
   - Delete (with confirmation)
   - See metadata (last edited, template, completion %)

---

## Questions for Discussion

1. **Resume Continuity**: Should we restore to the exact step where user left off, or always start from beginning?

2. **Resume Gallery Location**: 
   - Separate page in sidebar?
   - Or integrated into Resume Builder as initial screen?

3. **Resume Preview**: 
   - Generate thumbnail on save?
   - Or render preview on-the-fly in gallery?

4. **Auto-Save Frequency**: 
   - Keep 2 seconds?
   - Or reduce to 1 second for better UX?

5. **Resume Limits**: 
   - Should there be a limit on number of resumes per user?
   - Free plan: 1 resume, Premium: Unlimited?

6. **Resume Templates in Gallery**: 
   - Show which template was used?
   - Allow template switching from gallery?

---

## Next Steps

1. **Confirm Approach**: Review and approve this plan
2. **Priority**: Decide which phase to implement first
3. **Database**: Confirm if we need additional columns in `resumes` table
4. **UI/UX**: Review design mockups for resume gallery
5. **Implementation**: Start with Phase 1 (Resume Gallery) or Phase 2 (Resume Selection)?

---

## Estimated Implementation Time

- **Phase 1 (Resume Gallery)**: 4-6 hours
- **Phase 2 (Resume Selection)**: 2-3 hours
- **Phase 3 (Enhanced Auto-Save)**: 2-3 hours
- **Phase 4 (Management Features)**: 3-4 hours

**Total**: ~12-16 hours for complete implementation

