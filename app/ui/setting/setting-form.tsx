"use client"

import React from 'react'
import { User } from "next-auth"
import FormControl from "@/app/ui/form/form-control"
import Button from "@/app/ui/button/button"

export default function SettingForm({ user }: { user: User }) {
  return (
    <form action="">
      <FormControl
        label="Hourly wages"
        htmlFor="hourlywages"
        className="items-center mb-8"
        labelClassName="col-span-4 font-bold"
      >
        <input
          type="number"
          id="hourlywages"
          name="hourlywages"
          step={10}
          defaultValue={user.hourlywages}
          className="col-span-8 border-1 border-slate-400 bg-slate-100 p-2 mx-4 mb-2"
        />
      </FormControl>
      <FormControl
        label="Currency"
        htmlFor="currency"
        className="items-center mb-8"
        labelClassName="col-span-4 font-bold"
      >
        <select
          name=""
          id=""
          className="col-span-8 border-1 border-slate-400 bg-slate-100 p-2 mx-4 mb-2"
          defaultValue={user.currency}
        >
          <option value="">Select one</option>
          <option value="yen">YEN</option>
          <option value="usd">USD</option>
          <option value="rmb">RMB</option>
        </select>
      </FormControl>
      <FormControl
        label="Tax included"
        htmlFor="hourlywages"
        className="items-center mb-8"
        labelClassName="col-span-4 font-bold"
      >
        <FormControl
          label="Yes"
          htmlFor="yes"
          className="items-center col-span-2 mx-4"
          labelClassName="font-bold col-span-2"
        >
          <input
            type="radio"
            id="yes"
            name="yes"
            defaultChecked={user.taxincluded}
            className="mx-4 col-span-2 w-4"
          />
        </FormControl>
        <FormControl
          label="No"
          htmlFor="no"
          className="items-center col-span-2 mx-4"
          labelClassName="font-bold col-span-2"
        >
          <input
            type="radio"
            id="no"
            name="no"
            defaultChecked={!user.taxincluded}
            className="mx-4 col-span-2 w-4"
          />
        </FormControl>
      </FormControl>
      <div className="flex items-center">
        <Button type="submit" className="bg-lime-600 text-white mr-4">
          Save
        </Button>
      </div>
    </form>
  )
}
