'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, BarChart2, TrendingUp, Cloud, PieChart as PieChartIconComponent, Users, FileText, Search, Activity } from 'lucide-react'; // Renamed PieChart to PieChartIconComponent to avoid conflict
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'; // Added SheetHeader, SheetTitle

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Top', href: '#hero-section', icon: Search },
  { label: 'Summary', href: '#summary-cards-section', icon: BarChart2 },
  { label: 'Sentiment', href: '#overall-sentiment-section', icon: TrendingUp },
  { label: 'Emotions', href: '#emotion-distribution-section', icon: PieChartIconComponent },
  { label: 'Keywords', href: '#keywords-section', icon: Cloud },
  { label: 'Engagement', href: '#engagement-scores-section', icon: Activity },
  { label: 'Platforms', href: '#platform-comparison-section', icon: Users },
  { label: 'AI Report', href: '#ai-summary-report-section', icon: FileText },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('#hero-section');

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }

    let currentSection = '';
    for (let i = navItems.length - 1; i >= 0; i--) {
      const item = navItems[i];
      const element = document.getElementById(item.href.substring(1));
      if (element && element.offsetTop <= window.scrollY + window.innerHeight / 1.8) {
        currentSection = item.href;
        break;
      }
    }
    if (!currentSection) {
        if (window.scrollY < window.innerHeight / 2) {
            currentSection = '#hero-section';
        } else {
            const lastNavItem = navItems[navItems.length -1];
            const lastElement = document.getElementById(lastNavItem.href.substring(1));
            if (lastElement && window.scrollY > lastElement.offsetTop + lastElement.offsetHeight - window.innerHeight / 2) {
                currentSection = lastNavItem.href;
            } else {
                 currentSection = '#hero-section';
            }
        }
    }
    setActiveSection(currentSection);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();
    const sectionId = href.substring(1);
    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = document.querySelector('nav')?.offsetHeight || 0;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: sectionTop,
        behavior: 'smooth',
      });

      setActiveSection(href);
      // This part will be handled by onOpenChange if a link is clicked within the Sheet
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out animate-slide-down-fade',
        isScrolled || isMobileMenuOpen ? 'bg-background/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="#hero-section" onClick={(e) => scrollToSection(e, '#hero-section')} className="flex-shrink-0 group">
              <span className="text-2xl font-bold text-primary group-hover:text-primary/90 transition-colors">
                Brand<span className="text-accent group-hover:text-accent/90 transition-colors">Buzz</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={cn(
                    'group px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out transform',
                    activeSection === item.href
                      ? 'bg-primary text-primary-foreground scale-105 shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105',
                    'flex items-center gap-2'
                  )}
                  aria-current={activeSection === item.href ? 'page' : undefined}
                >
                  <item.icon className={cn("h-4 w-4",
                    activeSection === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground transition-colors"
                   )} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Navigation Trigger (Hamburger Menu for Sidebar) */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-controls="mobile-menu"
                  className="text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                >
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-background/95 backdrop-blur-lg p-0 w-[280px] sm:w-[300px]">
                <SheetHeader className="p-4 border-b border-border text-left">
                  <SheetTitle>
                    <Link
                        href="#hero-section"
                        onClick={(e) => {
                            scrollToSection(e, '#hero-section');
                            setIsMobileMenuOpen(false); // Close sheet
                        }}
                        className="flex-shrink-0 group"
                    >
                        <span className="text-2xl font-bold text-primary group-hover:text-primary/90 transition-colors">
                        Brand<span className="text-accent group-hover:text-accent/90 transition-colors">Buzz</span>
                        </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        scrollToSection(e, item.href);
                        setIsMobileMenuOpen(false); // Close sheet
                      }}
                      className={cn(
                        'block px-3 py-3 rounded-md text-base font-medium transition-colors',
                        activeSection === item.href
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                       'flex items-center gap-3'
                      )}
                      aria-current={activeSection === item.href ? 'page' : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}