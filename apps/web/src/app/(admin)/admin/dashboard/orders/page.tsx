"use client";

import { getAdminOrders } from "@/actions/admin/order";
import type { OrderOverview } from "@/db/queries/orderQueries";
import Link from "next/link";
import { useEffect, useReducer } from "react";

type State = {
  orders: OrderOverview[];
  isLoading: boolean;
  errorMessage: string | null;
  expandedId: string | null;
};

type Action =
  | { type: "load:start" }
  | { type: "load:success"; orders: OrderOverview[] }
  | { type: "load:error"; message: string }
  | { type: "expand:toggle"; orderId: string };

const initialState: State = {
  orders: [],
  isLoading: true,
  errorMessage: null,
  expandedId: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load:start":
      return { ...state, isLoading: true, errorMessage: null };
    case "load:success":
      return { ...state, isLoading: false, orders: action.orders };
    case "load:error":
      return { ...state, isLoading: false, errorMessage: action.message };
    case "expand:toggle":
      return {
        ...state,
        expandedId: state.expandedId === action.orderId ? null : action.orderId,
      };
    default:
      return state;
  }
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString();
}

export default function AdminOrdersPage() {
  const [{ orders, isLoading, errorMessage, expandedId }, dispatch] =
    useReducer(reducer, initialState);

  useEffect(() => {
    const loadOrders = async () => {
      dispatch({ type: "load:start" });

      try {
        const data = await getAdminOrders();
        dispatch({ type: "load:success", orders: data });
      } catch (error) {
        dispatch({
          type: "load:error",
          message:
            error instanceof Error ? error.message : "Failed to load orders",
        });
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-4 border-4 border-slate-700 bg-white p-4 sm:mb-6 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold tracking-wide text-gray-900 uppercase sm:text-3xl">
              Orders
            </h1>
            <p className="text-sm text-gray-700 sm:text-base">
              Review submitted customer orders and contact details
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="border-2 border-gray-400 px-4 py-2 text-center font-bold tracking-wide text-gray-700 uppercase transition-colors hover:border-slate-700 hover:text-slate-900 sm:px-6"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="border-3 border-gray-400 bg-white p-6 text-center sm:p-8">
          <p className="text-lg font-bold text-gray-900 uppercase sm:text-xl">
            Loading...
          </p>
        </div>
      ) : errorMessage ? (
        <div className="border-3 border-red-600 bg-red-100 p-6 sm:p-8">
          <p className="font-bold text-red-900 uppercase">{errorMessage}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="border-3 border-gray-400 bg-white p-6 text-center sm:p-8">
          <p className="text-lg font-bold text-gray-900 uppercase sm:text-xl">
            No Orders Yet
          </p>
          <p className="mt-2 text-sm text-gray-700 sm:text-base">
            Submitted orders will appear here once customers complete checkout.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const totalItems = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );

            return (
              <div key={order.id} className="border-3 border-gray-400 bg-white">
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "expand:toggle", orderId: order.id })
                  }
                  className="w-full px-4 py-4 text-left sm:px-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                          {order.name}
                        </h2>
                        <span className="border border-gray-300 px-2 py-1 text-xs font-bold tracking-wide text-gray-600 uppercase">
                          {totalItems} item{totalItems === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="mt-2 break-all text-xs font-semibold tracking-wide text-gray-500 uppercase sm:text-sm">
                        Order #{order.id}
                      </p>
                      <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                        <p>Email: {order.email || "Not provided"}</p>
                        <p>Phone: {order.phone || "Not provided"}</p>
                        <p>Submitted: {formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    <span className="self-start border-2 border-slate-700 px-3 py-1 text-xs font-bold tracking-wide text-slate-800 uppercase">
                      {isExpanded ? "Hide Details" : "View Details"}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t-2 border-gray-300 bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                      <div>
                        <h3 className="text-sm font-bold tracking-wide text-gray-900 uppercase">
                          Ordered Products
                        </h3>
                        <div className="mt-3 space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={`${order.id}-${item.product.id}`}
                              className="border-2 border-gray-200 bg-white px-4 py-3"
                            >
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {item.product.name || item.product.id}
                                  </p>
                                  <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                                    Product ID: {item.product.id}
                                  </p>
                                </div>
                                <p className="text-sm font-bold tracking-wide text-slate-700 uppercase">
                                  Qty {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold tracking-wide text-gray-900 uppercase">
                          Additional Comments
                        </h3>
                        <div className="mt-3 border-2 border-gray-200 bg-white px-4 py-3">
                          <p className="text-sm text-gray-700">
                            {order.additionalComments ||
                              "No additional comments."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
