import api from './api'

/**
 * Note Service
 * Manages application notes (timeline entries)
 * 
 * @module noteService
 */
export const noteService = {
    /**
     * Get all notes for a specific application
     * 
     * @param {number|string} applicationId - Application ID
     * @returns {Promise<Array<Note>>}
     */
    getNotes: async (applicationId) => {
        const response = await api.get(`/applications/${applicationId}/notes/`)
        return response.data
    },

    /**
     * Create a new note for an application
     * 
     * @param {number|string} applicationId - Application ID
     * @param {NoteInput} data - Note data
     * @returns {Promise<Note>}
     */
    createNote: async (applicationId, data) => {
        const response = await api.post(`/applications/${applicationId}/notes/`, data)
        return response.data
    },

    /**
     * Update an existing note
     * 
     * @param {number|string} applicationId - Application ID
     * @param {number|string} noteId - Note ID
     * @param {Partial<NoteInput>} data - Updated note data
     * @returns {Promise<Note>}
     */
    updateNote: async (applicationId, noteId, data) => {
        const response = await api.patch(`/applications/${applicationId}/notes/${noteId}/`, data)
        return response.data
    },

    /**
     * Delete a note
     * 
     * @param {number|string} applicationId - Application ID
     * @param {number|string} noteId - Note ID
     * @returns {Promise<void>}
     */
    deleteNote: async (applicationId, noteId) => {
        await api.delete(`/applications/${applicationId}/notes/${noteId}/`)
    }
}

/**
 * Note type options with labels and colors
 */
export const NOTE_TYPES = [
    { value: 'general', label: 'General', color: 'slate', icon: 'FileText' },
    { value: 'follow_up', label: 'Follow Up', color: 'blue', icon: 'RefreshCw' },
    { value: 'feedback', label: 'Feedback', color: 'purple', icon: 'MessageSquare' },
    { value: 'research', label: 'Company Research', color: 'amber', icon: 'Search' },
    { value: 'preparation', label: 'Interview Prep', color: 'emerald', icon: 'CheckSquare' }
]

/**
 * Get note type configuration by value
 * 
 * @param {string} type - Note type value
 * @returns {Object} Note type config
 */
export const getNoteTypeConfig = (type) => {
    return NOTE_TYPES.find(t => t.value === type) || NOTE_TYPES[0]
}

/**
 * @typedef {Object} Note
 * @property {number} id
 * @property {string} content
 * @property {string} note_type
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} NoteInput
 * @property {string} content
 * @property {string} [note_type='general']
 */
