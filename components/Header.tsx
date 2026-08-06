"use client";

import React from 'react'
import { Logo } from './logo'
import Link from 'next/link'
import { Button } from './button'

function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-[#FBFAF7]/85 px-10 py-4 backdrop-blur-md">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#governance" className="text-[13.5px] font-medium text-slate hover:text-navy">
            Risk Governance
          </a>
          <a href="#rigor" className="text-[13.5px] font-medium text-slate hover:text-navy">
            Statistical Rigor
          </a>
          <a href="#access" className="text-[13.5px] font-medium text-slate hover:text-navy">
            Access Tiers
          </a>
          <Link href="/login" className="text-[13.5px] font-medium text-slate hover:text-navy">
            Sign in
          </Link>
          <Button variant="gold" href="/register">
            Request access
          </Button>
        </nav>
      </header>
  )
}

export default Header