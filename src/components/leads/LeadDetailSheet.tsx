import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lead } from '@/lib/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Mail, 
  Building2, 
  Calendar, 
  MessageSquare, 
  Phone,
  ExternalLink,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeadDetailSheetProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
}

export function LeadDetailSheet({ lead, open, onClose }: LeadDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<'pending' | 'contacted' | 'responded' | 'converted'>(lead.status);
  const [notes, setNotes] = useState(lead.notes || '');
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      contacted: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      responded: 'bg-green-100 text-green-800 hover:bg-green-100',
      converted: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    };
    
    return (
      <Badge 
        variant="secondary" 
        className={colors[status as keyof typeof colors] || colors.pending}
      >
        {status}
      </Badge>
    );
  };

  const handleSave = () => {
    // Here you would typically call an API to update the lead
    toast({
      title: 'Lead Updated',
      description: 'Lead information has been successfully updated.',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setStatus(lead.status);
    setNotes(lead.notes || '');
    setIsEditing(false);
  };

  const handleClose = () => {
    if (isEditing) {
      handleCancel();
    }
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {getInitials(lead.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle>{lead.name}</SheetTitle>
                <SheetDescription>{lead.email}</SheetDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Contact Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="flex items-center gap-2">
                    <span>{lead.email}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {lead.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Company</div>
                    <span>{lead.company}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Last Contact</div>
                  <span>
                    {lead.last_contact_date 
                      ? format(new Date(lead.last_contact_date), 'PPP')
                      : 'Never contacted'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Campaign</h3>
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{lead.campaign?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {lead.campaign?.description}
                  </div>
                </div>
                <Badge variant="outline">
                  {lead.campaign?.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label>Status</Label>
            {isEditing ? (
              <Select value={status} onValueChange={(value) => setStatus(value as 'pending' | 'contacted' | 'responded' | 'converted')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div>{getStatusBadge(lead.status)}</div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label>Notes</Label>
            {isEditing ? (
              <Textarea
                placeholder="Add notes about this lead..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            ) : (
              <div className="min-h-[100px] rounded-md border p-3 text-sm">
                {lead.notes || (
                  <span className="text-muted-foreground">No notes added yet.</span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-medium">Activity Timeline</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm">Lead created</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
              {lead.last_contact_date && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm">Last contacted</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(lead.last_contact_date), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}