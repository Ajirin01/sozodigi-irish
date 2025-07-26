'use client'

import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

export default function DropdownPopover({
  title = 'Menu',
  items = [],
  callsToAction = [],
  buttonStyle = '',
}) {
  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button as={Fragment}>
            <button
              className={`${buttonStyle} inline-flex items-center gap-1`}
              type="button"
            >
              <span>{title}</span>
              <ChevronDownIcon className="size-5" aria-hidden="true" />
            </button>
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4">
              <div className="w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm shadow-lg ring-1 ring-gray-900/5">
                <div className="p-4">
                  {items.map((item) => (
                    <div
                      key={item.name}
                      className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => close()}
                    >
                      <div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                        <item.icon className="size-6 text-gray-600 group-hover:text-indigo-600" />
                      </div>
                      <div>
                        <Link href={item.href} className="font-semibold text-gray-900">
                          {item.name}
                          <span className="absolute inset-0" />
                        </Link>
                        <p className="mt-1 text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {callsToAction.length > 0 && (
                  <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                    {callsToAction.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => close()}
                        className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-gray-900 hover:bg-gray-100"
                      >
                        <item.icon className="size-5 flex-none text-gray-400" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
