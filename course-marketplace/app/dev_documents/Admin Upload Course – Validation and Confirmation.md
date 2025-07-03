## 📝 Feature Specification: **Admin Upload Course – Validation and Confirmation**

---

### **Overview**

When an admin is on the `/admin/upload` page and tries to submit a new course, the form must validate that all required fields are filled in. If everything is valid, a custom dialog will ask for final confirmation before actually submitting. On success, the user sees a confirmation and is redirected to `/admin/courses`.

---

### **User Story**

**Given** I am on the admin course upload page,
**When** I try to submit a new course,
**Then** the system validates all required fields,
**And** shows a custom confirmation dialog before final submission,
**And** if the upload succeeds, I see a confirmation and am redirected to the courses list.

---

### **Acceptance Criteria**

#### 1. **Required Fields**

The following fields **must** be provided before allowing submission:

* **Title** (text, required)
* **Description** (text/textarea, required)
* **Creator** (dropdown or user ID, required)
* **Price** (numeric, required)
* **Requirements** (text or list, required)
* **Thumbnail URL** (file upload or URL, required)
* **Course Video URL** (file upload or URL, required)

#### 2. **Validation**

* If any required field is empty or invalid, display a clear error message next to the field.
* The "Submit" button is disabled or gives feedback until all required fields are valid.

#### 3. **Custom Confirmation Dialog**

* After passing validation and clicking "Submit," show a custom modal dialog:

  * Message: "Are you sure you want to submit this course for publishing?"
  * Buttons: **Confirm** and **Cancel**
* If the admin clicks **Cancel**, the dialog closes and the form is not submitted.
* If the admin clicks **Confirm**, the course data is submitted to the backend.

#### 4. **Submission & Feedback**

* After a successful submission:

  * Show a confirmation message (e.g., “Course successfully uploaded!”).
  * Automatically redirect to `/admin/courses` after a short delay (e.g., 1–2 seconds).
* If submission fails, show an error message with details (do not redirect).

---

### **UI/UX Requirements**

* Validation errors are clearly visible next to each field.
* The confirmation dialog must be custom-styled and accessible (focus trap, keyboard navigation).
* After submitting, display a loading state on the button to prevent double submits.
* Confirmation message and redirect are smooth and user-friendly.

---

### **Database Fields Used**

* `title`
* `description`
* `creator_id`
* `price`
* `requirements`
* `thumbnail_url`
* `coursevideo_url`

---

### **Notes**

* Requirements can be a comma-separated string or array as fits your schema.
* Thumbnail and course video URLs should point to already uploaded files in storage.
* Redirection should not occur until submission and confirmation are successful.

