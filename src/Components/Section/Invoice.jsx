/* eslint-disable */

import InvoiceDataContext from "@/Context/InvoiceDataContext";
import { useUser } from "@/Context/UserContext";
import { createPaymentLink } from "@/Handlers/CreatepaymentLinkHandler";
import { GetCustomerInvoice } from "@/Handlers/GetCustomerInvoice";
import React, { useContext, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";

const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

const Invoice = React.forwardRef((props, ref) => {
  const [firstPartCustomers, setFirstPartCustomers] = useState([]);
  const [secondPartCustomers, setSecondPartCustomers] = useState([]);
  const [thirdPartCustomers, setThirdPartCustomers] = useState([]);
  const { invoicedata, setInvoicedata } = useContext(InvoiceDataContext);
  
  let totalBottles = 0;

  const user = useUser();
  const [customers, setCustomers] = useState([
    {
      _id: "666ca8dc0ce9a41b959a5347",
      cid: {
        _id: "665b66ece293adb9a2ebdd32",
        cname: "",
        caddress: "",
        cphone_number: "",
        bottle_price: 0,
      },
      bottle_count: 30,
      delivery_date: "2024-06-30",
      delivery_status: "Absent",
    },
  ]);

 
  useEffect(() => {
    const date = new Date(Date.now()).toISOString().split("T")[0];
    getdeliverydateData(date);
    document.title = `Invoice - ${user.user.shop_name} - ${
      new Date().toISOString().split("T")[0]
    }`;
  }, []);

  const token = localStorage.getItem("token");
  let sortedCustomers = [];
  const getData = async (deliveryDate) => {
    alert("Fetching Data.............");
    const customers = await fetch(
      `${DOMAIN_NAME}/api/customerentry/getallcustomerentry/${props.c_id}`,
      {
        method: "GET",
        headers: {
          authorization: "Bearer " + token,
        },
      }
    );
    const res = await customers.json();
    if (res.status === "success") {
     
      const currentMonth = new Date().getMonth();
     const currentYear = new Date().getFullYear();
     const selectedCustomers = res.data.filter((customer) => {
        const deliveryDate = new Date(customer.delivery_date);
        return (
          deliveryDate.getMonth() === currentMonth &&
          deliveryDate.getFullYear() === currentYear
        );
      });

      sortedCustomers = selectedCustomers.sort(
        (a, b) => new Date(a.delivery_date) - new Date(b.delivery_date)
      );

      totalBottles = sortedCustomers.reduce(
        (total, customer) => total + customer.bottle_count,
        0
      );

      const customerData = GetCustomerInvoice()
      const thirdIndex = Math.ceil(sortedCustomers.length / 3);
      setFirstPartCustomers(sortedCustomers.slice(0, thirdIndex));
      setSecondPartCustomers(sortedCustomers.slice(thirdIndex, thirdIndex * 2));
      setThirdPartCustomers(sortedCustomers.slice(thirdIndex * 2));

      setCustomers(sortedCustomers);
     
      return sortedCustomers[0];
    } else {
      return null;
    }
  };

  const getdeliverydateData = async (date) => {
    const data = getData(date);
    if (await data) {
      setInvoicedata({
        data: await data,
        total_bottles: totalBottles,
        shorturl: "",
      });
      alert("Data Fetched");
     
    }
  };

  // Get the current date
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const prefix = "INV";
  const sequenceNumber = Math.floor(Math.random() * 10000);
  const newInvoiceNumber = `${prefix}-${year}${month}${day}-${String(
    sequenceNumber
  ).padStart(4, "0")}`;
  // Add 5 days to the current date
  const futureDate = new Date(date);
  futureDate.setDate(date.getDate() + 5);
  // Format the date as needed (e.g., YYYY-MM-DD)
  const formattedDate = futureDate.toISOString().split("T")[0];


  const handleprint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      <div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto my-4 sm:my-10 ">
        {/* <!-- Invoice --> */}
        <div className="sm:w-11/12 lg:w-3/4 mx-auto">
          {/* <!-- Card --> */}
          <div
            className="flex flex-col p-4 sm:p-10 bg-white shadow-md rounded-xl dark:bg-neutral-800"
            ref={ref}
          >
            {/* <!-- Grid --> */}
            <div className="flex justify-between">
              <div>
                {/* Logo */}

                <h1 className="mt-2 text-lg md:text-xl font-semibold text-blue-600 dark:text-white">
                  {user.user.shop_name}
                </h1>
              </div>
              {/* <!-- Col --> */}

              <div className="text-end">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-neutral-200">
                  Invoice #
                </h2>
                <span className="mt-1 block text-gray-500 dark:text-neutral-500"></span>
                {newInvoiceNumber}
                <address className="mt-4 not-italic text-gray-800 dark:text-neutral-200">
                  {/* 45 Roker Terrace
                  <br />
                  Latheronwheel
                  <br />
                  KW5 8NW, London
                  <br />
                  United Kingdom <br /> */}
                  {user.user.shop_address}
                </address>
              </div>
              {/* <!-- Col --> */}
            </div>
            {/* <!-- End Grid --> */}

            {/* <!-- Grid --> */}
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                  Bill to:
                </h3>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                  {/* Customer Name */}
                  {customers[0].cid.cname}
                </h3>
                <address className="mt-2 not-italic text-gray-500 dark:text-neutral-500">
                  {/* 280 Suzanne Throughway,
                  <br />
                  Breannabury, OR 45801,
                  <br />
                  United States
                  <br /> */}
                  {customers[0].cid.caddress}
                  <br />
                  {customers[0].cid.cphone_number}
                </address>
              </div>
              {/* <!-- Col --> */}

              <div className="sm:text-end space-y-2">
                {/* <!-- Grid --> */}
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Invoice date:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {new Date(Date.now()).toISOString().split("T")[0]}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Due date:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {formattedDate}
                    </dd>
                  </dl>
                </div>
                {/* <!-- End Grid --> */}
              </div>
              {/* <!-- Col --> */}
            </div>
            {/* <!-- End Grid --> */}

            {/* <!-- Table --> */}
            <div className="mt-6 sm:flex gap-10">
              <div className="border border-gray-200 p-4 rounded-lg space-y-1 h-full dark:border-neutral-700 sm:w-1/2">
                <div className="hidden sm:grid sm:grid-cols-2 ">
                  <div className="text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Date
                  </div>
                  <div className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Qty
                  </div>
                </div>

                <div className=" sm:block border-b border-gray-200 dark:border-neutral-700"></div>

                {firstPartCustomers.map((customer) => (
                  // if
                  <div
                    key={customer._id}
                    className="grid grid-cols-2 sm:grid-cols-2 gap-2"
                  >
                    <div>
                      <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                        Date
                      </h5>
                      <p className="font-medium text-gray-800 dark:text-neutral-200">
                        {customer.delivery_date}
                      </p>
                    </div>
                    <div>
                      <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                        Qty
                      </h5>
                      <p className="text-gray-800 dark:text-neutral-200">
                        {customer.bottle_count}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="sm:hidden border-b border-gray-200 dark:border-neutral-700"></div>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg space-y-1 h-full dark:border-neutral-700 sm:w-1/2">
                <div className="hidden sm:grid sm:grid-cols-2 ">
                  <div className="text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Date
                  </div>
                  <div className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Qty
                  </div>
                </div>

                <div className=" sm:block border-b border-gray-200 dark:border-neutral-700"></div>

                {secondPartCustomers.map((customer) => (
                  // if
                  <div
                    key={customer._id}
                    className="grid grid-cols-2 sm:grid-cols-2 gap-2"
                  >
                    <div>
                      <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                        Date
                      </h5>
                      <p className="font-medium text-gray-800 dark:text-neutral-200">
                        {customer.delivery_date}
                      </p>
                    </div>
                    <div>
                      <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                        Qty
                      </h5>
                      <p className="text-gray-800 dark:text-neutral-200">
                        {customer.bottle_count}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="sm:hidden border-b border-gray-200 dark:border-neutral-700"></div>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg space-y-1 h-full dark:border-neutral-700 sm:w-1/2">
                <div className="hidden sm:grid sm:grid-cols-2 ">
                  <div className="text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Date
                  </div>
                  <div className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Qty
                  </div>
                </div>

                <div className=" sm:block border-b border-gray-200 dark:border-neutral-700"></div>

                {thirdPartCustomers.map((customer) => (
                  // if
                  <div
                    key={customer._id}
                    className="grid grid-cols-2 sm:grid-cols-2 gap-2"
                  >
                    <div>
                      <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                        Date
                      </h5>
                      <p className="font-medium text-gray-800 dark:text-neutral-200">
                        {customer.delivery_date}
                      </p>
                    </div>
                    <div>
                      <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                        Qty
                      </h5>
                      <p className="text-gray-800 dark:text-neutral-200">
                        {customer.bottle_count}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="sm:hidden border-b border-gray-200 dark:border-neutral-700"></div>
              </div>
            </div>
            {/* <!-- End Table --> */}

            {/* <!-- Flex --> */}
            <div className="mt-8 flex sm:justify-end">
              <div className="w-full max-w-2xl sm:text-end space-y-2">
                {/* <!-- Grid --> */}
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Bottle Price :
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {customers[0].cid.bottle_price}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Total Delivered Bottle :
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {totalBottles}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Subtotal:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {customers[0].cid.bottle_price * totalBottles}
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Total:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {customers[0].cid.bottle_price * totalBottles}
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Amount paid:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {customers[0].cid.bottle_price * totalBottles}
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Due balance:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      ₹0.00
                    </dd>
                  </dl>
                </div>
                {/* <!-- End Grid --> */}
              </div>
            </div>
            {/* <!-- End Flex --> */}

            <div className="mt-8 sm:mt-12">
              {/* <h2>LINK :{
                invoicedata.shorturl
                }</h2> */}
              <a
                href={invoicedata.shorturl}
                target="_blank"
                className="text-blue-600 underline cursor-pointer"
              >
                {" "}
                Pay Now
              </a>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                Thank you!
              </h4>
              <p className="text-gray-500 dark:text-neutral-500">
                If you have any questions concerning this invoice, use the
                following contact information:
              </p>
              <div className="mt-2">
                <p className="block text-sm font-medium text-gray-800 dark:text-neutral-200">
                  {user.user.uid.phone_number}
                </p>
                <p className="block text-sm font-medium text-gray-800 dark:text-neutral-200">
                  {user.user.uid.email}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm text-gray-500 dark:text-neutral-500">
              © 2022 Preline. [Shop Licence]
            </p>
          </div>
          {/* <!-- End Card --> */}

          {/* <!-- Buttons --> */}
          <div className="mt-6 flex justify-end gap-x-3">
            <button
              className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-lg border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-neutral-800 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white dark:focus:ring-offset-gray-800"
              onClick={() => {
                alert("Fetch Data");
              }}
            >
              <svg
                className="flex-shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Fetch Data
            </button>

            <button
              onClick={handleprint}
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              <svg
                className="flex-shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
              Print
            </button>
          </div>
          {/* <!-- End Buttons --> */}
        </div>
        {/* <!-- End Invoice --> */}
      </div>
    </>
  );
});
export default Invoice;
