"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";

const mobileQuickLinks = [
  { href: "/apartments", label: "Apartments" },
  { href: "/subleases", label: "Subleases" },
  { href: "/marketplace", label: "Market" },
] as const;

const primarySubmitLinks = [
  { href: "/submit/listing", label: "Sell an item" },
] as const;

const secondarySubmitLinks = [
  { href: "/submit/moveout", label: "Move-out sale" },
] as const;

const otherSubmitLinks = [
  { href: "/submit/sublease", label: "List your sublease" },
  { href: "/submit/photo", label: "Submit a photo" },
  { href: "/submit/review", label: "Submit a review" },
] as const;

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/75 dark:border-border">
      <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 md:gap-8">
          <Link
            href="/"
            className="font-heading shrink-0 text-lg font-bold tracking-tight text-foreground underline-offset-4 transition-colors hover:text-amber-600 sm:text-xl dark:hover:text-amber-400"
          >
            ASU Orbit
          </Link>
          <nav
            className="flex min-w-0 flex-1 items-center justify-center gap-x-2.5 overflow-x-auto py-1 [scrollbar-width:none] sm:gap-x-5 md:hidden [&::-webkit-scrollbar]:hidden"
            aria-label="Sections"
          >
            {mobileQuickLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="shrink-0 whitespace-nowrap text-xs font-semibold tracking-tight text-muted-foreground underline-offset-4 transition-colors hover:text-amber-600 sm:text-[13px] dark:hover:text-amber-400"
              >
                {label}
              </Link>
            ))}
          </nav>
          <nav
            className="hidden items-center gap-7 md:flex"
            aria-label="Main"
          >
            <Link
              href="/apartments"
              className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-amber-600 dark:hover:text-amber-400"
            >
              Apartments
            </Link>
            <Link
              href="/subleases"
              className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-amber-600 dark:hover:text-amber-400"
            >
              Subleases
            </Link>
            <Link
              href="/marketplace"
              className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-amber-600 dark:hover:text-amber-400"
            >
              Marketplace
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 px-3 text-[15px] font-medium text-muted-foreground hover:bg-muted/80 hover:text-amber-600 dark:hover:text-amber-400"
                >
                  Submit
                  <ChevronDown className="size-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-48">
                {primarySubmitLinks.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {secondarySubmitLinks.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="text-muted-foreground">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {otherSubmitLinks.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ModeToggle />
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-border/80 md:hidden"
                aria-label="Submit menu"
              >
                <Plus className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="gap-0 sm:max-w-sm">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-left">Submit</DialogTitle>
              </DialogHeader>
              <nav className="flex flex-col gap-1 py-4" aria-label="Mobile submit menu">
                <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Submit
                </p>
                {primarySubmitLinks.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="justify-start pl-4 font-normal"
                    asChild
                  >
                    <Link href={item.href} onClick={() => setMobileOpen(false)}>
                      {item.label}
                    </Link>
                  </Button>
                ))}
                {secondarySubmitLinks.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="justify-start pl-4 font-normal text-muted-foreground"
                    asChild
                  >
                    <Link href={item.href} onClick={() => setMobileOpen(false)}>
                      {item.label}
                    </Link>
                  </Button>
                ))}
                <div className="mx-2 my-1 border-t" />
                {otherSubmitLinks.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="justify-start pl-4 font-normal"
                    asChild
                  >
                    <Link href={item.href} onClick={() => setMobileOpen(false)}>
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
