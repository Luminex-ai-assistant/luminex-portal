import { MoreHorizontal, Shield, User, UserCog } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AvatarComponent } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import type { WorkspaceMember, WorkspaceMemberRole } from '@/types/workspace';

interface MembersListProps {
  members: WorkspaceMember[];
}

const roleConfig: Record<WorkspaceMemberRole, { label: string; icon: typeof User; color: 'default' | 'secondary' | 'warning' }> = {
  owner: { label: 'Owner', icon: Shield, color: 'default' },
  admin: { label: 'Admin', icon: UserCog, color: 'warning' },
  member: { label: 'Member', icon: User, color: 'secondary' },
  guest: { label: 'Guest', icon: User, color: 'secondary' },
};

export function MembersList({ members }: MembersListProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No members found</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-800">
          {members.map((member) => {
            const role = roleConfig[member.role];
            const RoleIcon = role.icon;

            return (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <AvatarComponent
                    src={member.user.avatarUrl || undefined}
                    alt={member.user.name}
                    fallback={member.user.name.charAt(0).toUpperCase()}
                    size="md"
                  />
                  <div>
                    <div className="font-medium text-slate-200">{member.user.name}</div>
                    <div className="text-sm text-slate-500">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={role.color} className="gap-1">
                    <RoleIcon className="h-3 w-3" />
                    {role.label}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400">
                        Remove from Workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
