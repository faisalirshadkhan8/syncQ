/**
 * Webhook List Page
 * Comprehensive webhook management with creation, testing, and delivery monitoring.
 * 
 * @module pages/webhooks/WebhookList
 * @see FRONTEND_API_DOCUMENTATION.md Section 10: Webhooks
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Webhook, Plus, Play, RotateCw, Trash2, Eye, AlertCircle,
  CheckCircle2, XCircle, Clock, ExternalLink, Copy, Key, Settings
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import webhookService from '@/services/webhookService';

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Webhook card component
 */
function WebhookCard({ webhook, onToggle, onTest, onDelete, onViewLogs, onRegenerateSecret }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          webhook.is_active ? "bg-emerald-100" : "bg-slate-100"
        )}>
          <Webhook size={24} className={webhook.is_active ? "text-emerald-600" : "text-slate-400"} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 truncate">
              {webhook.url}
            </h3>
            <Badge variant={webhook.is_active ? "success" : "default"}>
              {webhook.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {webhook.description && (
            <p className="text-sm text-slate-500 mb-3">{webhook.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Created {format(new Date(webhook.created_at), 'MMM d, yyyy')}
            </span>
            {webhook.last_triggered_at && (
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} />
                Last triggered {format(new Date(webhook.last_triggered_at), 'MMM d, yyyy')}
              </span>
            )}
          </div>

          {/* Events */}
          <div className="flex flex-wrap gap-1 mb-3">
            {webhook.events?.map((event) => (
              <Badge key={event} variant="info" size="sm">
                {event}
              </Badge>
            ))}
          </div>

          {/* Expandable Secret */}
          {isExpanded && (
            <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">Webhook Secret</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRegenerateSecret(webhook)}
                  className="text-xs"
                >
                  <Key size={12} className="mr-1" />
                  Regenerate
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                  {webhook.secret || '••••••••••••••••'}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(webhook.secret)}
                  className="text-xs"
                >
                  <Copy size={12} />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(webhook)}
            >
              {webhook.is_active ? "Disable" : "Enable"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTest(webhook)}
            >
              <Play size={14} className="mr-1" />
              Test
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewLogs(webhook)}
            >
              <Eye size={14} className="mr-1" />
              Logs
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Settings size={14} className="mr-1" />
              {isExpanded ? "Hide" : "Show"} Secret
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(webhook)}
              className="text-rose-500 hover:text-rose-600"
            >
              <Trash2 size={14} className="mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Webhook creation modal
 */
function WebhookFormModal({ isOpen, onClose, eventTypes, eventsError }) {
  const [formData, setFormData] = useState({
    url: '',
    description: '',
    events: [],
    is_active: true
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!formData.url) {
      newErrors.url = 'URL is required';
    } else {
      const validation = webhookService.validateWebhookUrl(formData.url);
      if (!validation.valid) {
        newErrors.url = validation.error;
      }
    }
    
    if (formData.events.length === 0) {
      newErrors.events = 'Select at least one event';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onClose(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(null)}
      title="Create Webhook"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Webhook URL *
          </label>
          <Input
            type="url"
            placeholder="https://your-app.com/webhook"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            error={errors.url}
          />
          {errors.url && (
            <p className="text-xs text-rose-600 mt-1">{errors.url}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Must be a valid HTTPS URL in production
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <Input
            placeholder="My Slack notifications webhook"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Events to Subscribe *
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto p-3 border border-slate-200 rounded-lg">
            {eventsError ? (
              <div className="text-center py-4">
                <p className="text-sm text-rose-600 mb-2">Failed to load events</p>
                <p className="text-xs text-slate-500">Please try again later</p>
              </div>
            ) : (!eventTypes || eventTypes.length === 0) ? (
              <p className="text-sm text-slate-500 text-center py-4">Loading events...</p>
            ) : (
              eventTypes.map((event) => (
              <label key={event.name} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={formData.events.includes(event.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        events: [...formData.events, event.name]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        events: formData.events.filter((ev) => ev !== event.name)
                      });
                    }
                  }}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{event.name}</p>
                  <p className="text-xs text-slate-500">{event.description}</p>
                </div>
              </label>
              ))
            )}
          </div>
          {errors.events && (
            <p className="text-xs text-rose-600 mt-1">{errors.events}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="is_active" className="text-sm text-slate-700">
            Enable webhook immediately
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={() => onClose(null)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Create Webhook
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Delivery logs modal
 */
function DeliveryLogsModal({ isOpen, onClose, webhook, onRetry }) {
  const { data, isLoading } = useQuery({
    queryKey: ['webhook-deliveries', webhook?.id],
    queryFn: () => webhookService.getDeliveries({ endpoint: webhook.id }),
    enabled: isOpen && !!webhook
  });

  const deliveries = data?.results || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delivery Logs: ${webhook?.url}`}
      size="xl"
    >
      <div className="space-y-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : deliveries.length === 0 ? (
          <EmptyState
            icon={Eye}
            title="No deliveries yet"
            description="Webhook deliveries will appear here"
          />
        ) : (
          deliveries.map((delivery) => {
            const statusInfo = webhookService.formatDeliveryStatus(delivery.status);
            return (
              <Card key={delivery.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={delivery.status === 'success' ? 'success' : 'error'}>
                      {statusInfo.label}
                    </Badge>
                    <span className="text-sm font-medium text-slate-700">
                      {delivery.event_type}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {format(new Date(delivery.created_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                
                <div className="text-sm text-slate-600 mb-2">
                  <span className="font-medium">Status Code:</span> {delivery.response_status || 'N/A'}
                </div>
                
                {delivery.status === 'failure' && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetry(delivery)}
                    >
                      <RotateCw size={14} className="mr-1" />
                      Retry
                    </Button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </Modal>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function WebhookList() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingWebhook, setDeletingWebhook] = useState(null);
  const [logsWebhook, setLogsWebhook] = useState(null);
  const [regeneratingSecret, setRegeneratingSecret] = useState(null);

  // Fetch webhooks
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => webhookService.getWebhooks()
  });

  // Fetch event types
  const { data: eventTypesData, isError: eventsError, error: eventsErrorObj } = useQuery({
    queryKey: ['webhook-events'],
    queryFn: () => webhookService.getEventTypes()
  });

  const webhooks = data?.results || [];
  const eventTypes = React.useMemo(() => eventTypesData?.events || [], [eventTypesData]);

  // Debug logging
  React.useEffect(() => {
    if (eventTypesData) {
      console.log('Event types data received:', eventTypesData);
      console.log('Parsed eventTypes:', eventTypes);
    }
    if (eventsError) {
      console.error('Event types error:', eventsErrorObj);
    }
  }, [eventTypesData, eventTypes, eventsError, eventsErrorObj]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => webhookService.createWebhook(data),
    onSuccess: () => {
      toast.success('Webhook created successfully!');
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setIsCreateModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create webhook');
    }
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => webhookService.patchWebhook(id, { is_active }),
    onSuccess: () => {
      toast.success('Webhook updated!');
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
    onError: () => {
      toast.error('Failed to update webhook');
    }
  });

  // Test mutation
  const testMutation = useMutation({
    mutationFn: (id) => webhookService.testWebhook(id),
    onSuccess: () => {
      toast.success('Test webhook sent successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Test failed');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => webhookService.deleteWebhook(id),
    onSuccess: () => {
      toast.success('Webhook deleted!');
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setDeletingWebhook(null);
    },
    onError: () => {
      toast.error('Failed to delete webhook');
    }
  });

  // Regenerate secret mutation
  const regenerateSecretMutation = useMutation({
    mutationFn: (id) => webhookService.regenerateSecret(id),
    onSuccess: () => {
      toast.success('Secret regenerated!');
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setRegeneratingSecret(null);
    },
    onError: () => {
      toast.error('Failed to regenerate secret');
    }
  });

  // Retry delivery mutation
  const retryMutation = useMutation({
    mutationFn: (id) => webhookService.retryDelivery(id),
    onSuccess: () => {
      toast.success('Delivery retried!');
      queryClient.invalidateQueries({ queryKey: ['webhook-deliveries'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Retry failed');
    }
  });

  // Handlers
  const handleCreate = (formData) => {
    if (formData) {
      createMutation.mutate(formData);
    } else {
      setIsCreateModalOpen(false);
    }
  };

  const handleToggle = (webhook) => {
    toggleMutation.mutate({
      id: webhook.id,
      is_active: !webhook.is_active
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Webhooks</h1>
            <p className="text-slate-600">
              Configure webhooks to receive real-time notifications for events
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            Create Webhook
          </Button>
        </div>

        {/* Webhooks List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : isError ? (
          <Card className="p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-rose-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load webhooks</h3>
            <p className="text-slate-500 mb-4">
              {error?.response?.data?.detail || error?.message || 'An error occurred'}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['webhooks'] })}>
              Try Again
            </Button>
          </Card>
        ) : webhooks.length === 0 ? (
          <EmptyState
            icon={Webhook}
            title="No webhooks configured"
            description="Create your first webhook to receive real-time notifications"
            action={
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                Create Webhook
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                onToggle={handleToggle}
                onTest={(w) => testMutation.mutate(w.id)}
                onDelete={setDeletingWebhook}
                onViewLogs={setLogsWebhook}
                onRegenerateSecret={setRegeneratingSecret}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <WebhookFormModal
          isOpen={isCreateModalOpen}
          onClose={handleCreate}
          eventTypes={eventTypes}
          eventsError={eventsError}
        />

        <DeliveryLogsModal
          isOpen={!!logsWebhook}
          onClose={() => setLogsWebhook(null)}
          webhook={logsWebhook}
          onRetry={(delivery) => retryMutation.mutate(delivery.id)}
        />

        <ConfirmDialog
          isOpen={!!deletingWebhook}
          onClose={() => setDeletingWebhook(null)}
          onConfirm={() => deleteMutation.mutate(deletingWebhook.id)}
          isLoading={deleteMutation.isPending}
          title="Delete Webhook"
          description={`Are you sure you want to delete this webhook? This action cannot be undone.`}
          confirmLabel="Delete"
          isDestructive
        />

        <ConfirmDialog
          isOpen={!!regeneratingSecret}
          onClose={() => setRegeneratingSecret(null)}
          onConfirm={() => regenerateSecretMutation.mutate(regeneratingSecret.id)}
          isLoading={regenerateSecretMutation.isPending}
          title="Regenerate Secret"
          description="This will invalidate the current secret. You'll need to update your webhook endpoint with the new secret."
          confirmLabel="Regenerate"
        />
      </div>
    </div>
  );
}
