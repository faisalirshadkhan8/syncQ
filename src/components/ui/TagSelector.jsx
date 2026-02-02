/**
 * TagSelector Component
 * Multi-select tag component for applications with create-on-the-fly capability.
 * 
 * @module components/ui/TagSelector
 */

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Check, Search, Tag as TagIcon, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getTags, createTag, getTagColorConfig, TAG_COLORS } from '@/services/tagService';

/**
 * Single tag badge component
 */
function TagBadge({ tag, onRemove, size = 'default' }) {
  const colorConfig = getTagColorConfig(tag.color);
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        colorConfig.bg,
        colorConfig.text,
        colorConfig.border,
        size === 'sm' ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      )}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className={cn(
            "rounded-full p-0.5 hover:bg-black/10 transition-colors",
            size === 'sm' ? "-mr-1" : "-mr-0.5"
          )}
        >
          <X size={size === 'sm' ? 10 : 12} />
        </button>
      )}
    </span>
  );
}

/**
 * Color picker for new tag creation
 */
function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5 p-2">
      {Object.entries(TAG_COLORS).map(([key, config]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "w-6 h-6 rounded-full border-2 transition-all",
            config.bg,
            value === key ? "ring-2 ring-offset-1 ring-slate-400 scale-110" : "hover:scale-110"
          )}
          title={key.charAt(0).toUpperCase() + key.slice(1)}
        />
      ))}
    </div>
  );
}

/**
 * @typedef {Object} TagSelectorProps
 * @property {Object[]} value - Currently selected tags
 * @property {Function} onChange - Callback when tags change
 * @property {string} [placeholder] - Placeholder text
 * @property {boolean} [disabled] - Disable the selector
 * @property {boolean} [allowCreate] - Allow creating new tags
 * @property {number} [maxTags] - Maximum number of tags allowed
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Tag selector with search and create capability
 * @param {TagSelectorProps} props
 */
export default function TagSelector({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  disabled = false,
  allowCreate = true,
  maxTags,
  className
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTagColor, setNewTagColor] = useState('blue');
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch all available tags
  const { data: tagsData, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(),
    staleTime: 60000
  });

  // Create tag mutation
  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      onChange([...value, newTag]);
      setSearch('');
      setIsCreating(false);
      setNewTagColor('blue');
    }
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available tags
  const allTags = tagsData?.tags || [];
  const selectedIds = value.map(t => t.id);
  const availableTags = allTags.filter(tag => 
    !selectedIds.includes(tag.id) &&
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  // Check if search matches existing tag exactly
  const exactMatch = allTags.some(
    tag => tag.name.toLowerCase() === search.toLowerCase()
  );

  // Can create new tag?
  const canCreate = allowCreate && search.trim() && !exactMatch;
  const canAddMore = !maxTags || value.length < maxTags;

  const handleSelect = (tag) => {
    if (canAddMore) {
      onChange([...value, tag]);
      setSearch('');
      inputRef.current?.focus();
    }
  };

  const handleRemove = (tagToRemove) => {
    onChange(value.filter(t => t.id !== tagToRemove.id));
  };

  const handleCreateTag = () => {
    if (canCreate && !createMutation.isPending) {
      createMutation.mutate({
        name: search.trim(),
        color: newTagColor
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && !search && value.length > 0) {
      handleRemove(value[value.length - 1]);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (availableTags.length > 0) {
        handleSelect(availableTags[0]);
      } else if (canCreate) {
        setIsCreating(true);
      }
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setIsCreating(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input Container */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2",
          "rounded-lg border border-slate-200 bg-white",
          "transition-all duration-200",
          isOpen && "ring-2 ring-teal-brand-500/20 border-teal-brand-300",
          disabled && "bg-slate-50 cursor-not-allowed opacity-60"
        )}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {/* Selected Tags */}
        {value.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            onRemove={disabled ? undefined : handleRemove}
            size="sm"
          />
        ))}

        {/* Input */}
        {canAddMore && !disabled && (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
        )}

        {/* Max tags indicator */}
        {maxTags && (
          <span className="text-xs text-slate-400 ml-auto">
            {value.length}/{maxTags}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          ) : isCreating ? (
            /* Create new tag form */
            <div className="p-3">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Create tag: "{search}"
              </p>
              <p className="text-xs text-slate-500 mb-3">Select a color:</p>
              <ColorPicker value={newTagColor} onChange={setNewTagColor} />
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={createMutation.isPending}
                  className="flex-1 px-3 py-2 text-sm bg-teal-brand-500 text-white rounded-lg hover:bg-teal-brand-600 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin mx-auto" />
                  ) : (
                    'Create Tag'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Search results */}
              <div className="max-h-[200px] overflow-y-auto">
                {availableTags.length === 0 && !canCreate ? (
                  <div className="py-6 text-center text-sm text-slate-500">
                    {search ? 'No matching tags' : 'No tags available'}
                  </div>
                ) : (
                  <>
                    {availableTags.map((tag) => {
                      const colorConfig = getTagColorConfig(tag.color);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleSelect(tag)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
                        >
                          <span
                            className={cn(
                              "w-3 h-3 rounded-full",
                              colorConfig.bg,
                              "border",
                              colorConfig.border
                            )}
                          />
                          <span className="flex-1 text-sm text-slate-700">{tag.name}</span>
                          {tag.application_count > 0 && (
                            <span className="text-xs text-slate-400">
                              {tag.application_count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Create new option */}
              {canCreate && (
                <div className="border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-teal-brand-600 hover:bg-teal-brand-50 transition-colors"
                  >
                    <Plus size={16} />
                    Create "{search}"
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Export TagBadge for use in other components
 */
export { TagBadge };
