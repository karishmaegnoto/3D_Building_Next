"use client";

import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socket/socketClient";
import { getQueryClient } from "@/lib/query/queryClient";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

export default function SocketNotifications() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return undefined;
    }
    const socket = connectSocket(token);
    if (!socket) return undefined;


    const onQuoteShared = (payload) => {
  getQueryClient().invalidateQueries({ queryKey: ["approvals"] });
  getQueryClient().invalidateQueries({ queryKey: ["lead-quotes"] });
  const by = payload?.sharedBy?.name || payload?.sharedBy?.email || "Someone";
  useToastStore.getState().success(`${by} shared a quote with you.`);
};
const onQuoteShareStatusUpdated = (payload) => {
  getQueryClient().invalidateQueries({ queryKey: ["approvals"] });
  getQueryClient().invalidateQueries({ queryKey: ["lead-quotes"] });
  const by = payload?.updatedBy?.name || payload?.updatedBy?.email || "Someone";
  const status = payload?.status ? String(payload.status).toLowerCase() : "updated";
  useToastStore.getState().info(`${by} ${status} your shared quote.`);
};


    const onContractShared = (payload) => {
      getQueryClient().invalidateQueries({ queryKey: ["approvals"] });
      getQueryClient().invalidateQueries({ queryKey: ["contracts"] });
      getQueryClient().invalidateQueries({ queryKey: ["contract-approvals"] });
      const by = payload?.sharedBy?.name || payload?.sharedBy?.email || "Someone";
      useToastStore.getState().success(`${by} shared a contract with you.`);
    };

    const onContractShareStatusUpdated = (payload) => {
      getQueryClient().invalidateQueries({ queryKey: ["approvals"] });
      getQueryClient().invalidateQueries({ queryKey: ["contracts"] });
      getQueryClient().invalidateQueries({ queryKey: ["contract-approvals"] });
      const by = payload?.updatedBy?.name || payload?.updatedBy?.email || "Someone";
      const status = payload?.status ? String(payload.status).toLowerCase() : "updated";
      useToastStore.getState().info(`${by} ${status} your shared contract.`);
    };

    socket.on("quote_shared", onQuoteShared);
    socket.on("quote_share_status_updated", onQuoteShareStatusUpdated);
    socket.on("contract_shared", onContractShared);
    socket.on("contract_share_status_updated", onContractShareStatusUpdated);
    const onConnectError = (err) => {
      const msg = String(err?.message || "");
      if (/auth|expired|unauthorized|invalid token/i.test(msg)) {
        socket.off("connect_error", onConnectError);
        disconnectSocket();
      }
    };
    socket.on("connect_error", onConnectError);
    return () => {
      socket.off("quote_shared", onQuoteShared);
      socket.off("quote_share_status_updated", onQuoteShareStatusUpdated);
      socket.off("contract_shared", onContractShared);
      socket.off("contract_share_status_updated", onContractShareStatusUpdated);
      socket.off("connect_error", onConnectError);
    };
  }, [token]);

  useEffect(
    () => () => {
      disconnectSocket();
    },
    []
  );

  return null;
}
