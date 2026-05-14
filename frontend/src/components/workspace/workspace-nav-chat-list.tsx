"use client";

import {
  BotIcon,
  FlameIcon,
  KeyRoundIcon,
  LibraryIcon,
  MessagesSquare,
  NewspaperIcon,
  SendIcon,
  WandSparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useI18n } from "@/core/i18n/hooks";

export function WorkspaceNavChatList() {
  const { t } = useI18n();
  const pathname = usePathname();
  return (
    <>
      {/* Core */}
      <SidebarGroup className="pt-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/workspace/chats"}
              asChild
            >
              <Link className="text-muted-foreground" href="/workspace/chats">
                <MessagesSquare />
                <span>{t.sidebar.chats}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith("/workspace/agents")}
              asChild
            >
              <Link className="text-muted-foreground" href="/workspace/agents">
                <BotIcon />
                <span>{t.sidebar.agents}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Content Suite */}
      <SidebarGroup>
        <SidebarGroupLabel>内容工坊</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith("/workspace/hot-radar")}
              asChild
            >
              <Link
                className="text-muted-foreground"
                href="/workspace/hot-radar"
              >
                <FlameIcon />
                <span>热点雷达</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith("/workspace/studio")}
              asChild
            >
              <Link className="text-muted-foreground" href="/workspace/studio">
                <NewspaperIcon />
                <span>内容工作台</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith("/workspace/materials")}
              asChild
            >
              <Link
                className="text-muted-foreground"
                href="/workspace/materials"
              >
                <LibraryIcon />
                <span>素材文库</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith("/workspace/creative")}
              asChild
            >
              <Link
                className="text-muted-foreground"
                href="/workspace/creative"
              >
                <WandSparklesIcon />
                <span>创意变换</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith("/workspace/publish")}
              asChild
            >
              <Link className="text-muted-foreground" href="/workspace/publish">
                <SendIcon />
                <span>发布中心</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith("/workspace/accounts")}
              asChild
            >
              <Link className="text-muted-foreground" href="/workspace/accounts">
                <KeyRoundIcon />
                <span>账号管理</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
