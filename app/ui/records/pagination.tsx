'use client'

import {usePathname, useSearchParams} from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import {
  getMonthIndex,
  generatePageIndexes,
  createPageURL,
  getMonthStr
} from '@/app/lib/helpers'

export default function Pagination({uniqueMonths}: {uniqueMonths: string[]}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPageIndex = Number(searchParams.get('page')) || getMonthIndex(getMonthStr(new Date()), uniqueMonths)
  const totalPages = uniqueMonths.length
  const pageIndexes = generatePageIndexes(currentPageIndex, totalPages)

  return (
    <div className="flex justify-center mt-8">
      <PaginationArrow
        direction="left"
        href={createPageURL(pathname, searchParams, currentPageIndex - 1)}
        isDisabled={currentPageIndex <= 1}
      />
      <div className="flex">
        {pageIndexes.map((pageIndex, i) => {
          let position: 'first' | 'last' | 'single' | 'middle' | undefined;

          if (i === 0) position = 'first';
          if (i === pageIndexes.length - 1) position = 'last';
          if (pageIndexes.length === 1) position = 'single';
          if (pageIndex === '...') position = 'middle';

          return (
            <PaginationNumber
              key={pageIndex}
              href={createPageURL(pathname, searchParams, pageIndex)}
              page={pageIndex}
              position={position}
              isActive={currentPageIndex === pageIndex}
            />
          )
        })}
      </div>
      <PaginationArrow
        direction="right"
        href={createPageURL(pathname, searchParams, currentPageIndex + 1)}
        isDisabled={currentPageIndex >= totalPages}
      />
    </div>
  )
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: 'first' | 'last' | 'middle' | 'single';
  isActive: boolean;
}) {
  const className = clsx(
    'flex h-10 w-10 items-center justify-center text-sm border',
    {
      'rounded-l-md': position === 'first' || position === 'single',
      'rounded-r-md': position === 'last' || position === 'single',
      'z-10 bg-blue-600 border-blue-600 text-white': isActive,
      'hover:bg-gray-100': !isActive && position !== 'middle',
      'text-gray-300': position === 'middle',
    },
  );

  return isActive || position === 'middle' ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className}>
      {page}
    </Link>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: 'left' | 'right';
  isDisabled?: boolean;
}) {
  const className = clsx(
    'flex h-10 w-10 items-center justify-center rounded-md border',
    {
      'pointer-events-none text-gray-300': isDisabled,
      'hover:bg-gray-100': !isDisabled,
      'mr-2 md:mr-4': direction === 'left',
      'ml-2 md:ml-4': direction === 'right',
    },
  );

  const icon =
    direction === 'left' ? (
      <ArrowLeftIcon className="w-4" />
    ) : (
      <ArrowRightIcon className="w-4" />
    );

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link className={className} href={href}>
      {icon}
    </Link>
  );
}
