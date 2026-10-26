"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { quotesApi } from "@/lib/api/quotes";
import { useAuthStore } from "@/store/authStore";

function personName(person) {
  if (!person || typeof person !== "object") return "";
  const full = [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
  return full || person.name || person.username || person.email || "";
}

export function flattenApprovals(quotes, myId) {
  const items = [];
  for (const quote of Array.isArray(quotes) ? quotes : []) {
    const quoteId = quote?._id || quote?.id;
    const lead = quote?.leadId && typeof quote.leadId === "object" ? quote.leadId : null;
    for (const entry of quote?.sharedWith || []) {
      const recipientId = entry?.user?._id || entry?.user?.id || entry?.user;
      if (!myId || String(recipientId) !== String(myId)) continue;
      const senderName = personName(entry?.sharedBy);
      const leadName = lead
        ? [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim()
        : "";
      items.push({
        key: String(entry?._id || `${quoteId}-${recipientId}`),
        quoteId: quoteId ? String(quoteId) : null,
        quoteTitle: quote?.name || quote?.quoteNumber || "Quote",
        leadId: lead?._id ? String(lead._id) : null,
        leadName,
        senderName,
        status: entry?.status || "Pending",
        messages: Array.isArray(entry?.messages) ? entry.messages : [],
        notes: entry?.notes || "",
        date: entry?.updatedAt || entry?.sharedAt || quote?.updatedAt,
        approved: entry?.status === "Approved",
        rejected: entry?.status === "Rejected",
      });
    }
  }
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return items;
}

export function flattenSentApprovals(quotes, myId) {
  const items = [];
  for (const quote of Array.isArray(quotes) ? quotes : []) {
    const quoteId = quote?._id || quote?.id;
    const lead = quote?.leadId && typeof quote.leadId === "object" ? quote.leadId : null;
    for (const entry of quote?.sharedWith || []) {
      const recipientId = entry?.user?._id || entry?.user?.id || entry?.user;
      const senderId = entry?.sharedBy?._id || entry?.sharedBy?.id || entry?.sharedBy;
      if (!myId || String(senderId) !== String(myId)) continue;
      if (String(recipientId) === String(myId)) continue;
      if (entry?.status !== "Approved" && entry?.status !== "Rejected") continue;
      const recipientName = personName(entry?.user);
      const leadName = lead
        ? [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim()
        : "";
      items.push({
        key: String(entry?._id || `${quoteId}-${recipientId}-sent`),
        quoteId: quoteId ? String(quoteId) : null,
        quoteTitle: quote?.name || quote?.quoteNumber || "Quote",
        leadId: lead?._id ? String(lead._id) : null,
        leadName,
        senderName: recipientName,
        status: entry?.status || "Pending",
        messages: Array.isArray(entry?.messages) ? entry.messages : [],
        notes: entry?.notes || "",
        date: entry?.updatedAt || entry?.sharedAt || quote?.updatedAt,
        approved: entry?.status === "Approved",
        rejected: entry?.status === "Rejected",
        outgoing: true,
      });
    }
  }
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return items;
}

export async function fetchApprovalQuotes(signal) {
  const res = await quotesApi.getQuotesList({}, { signal });
  return Array.isArray(res) ? res : res?.results || res?.data || res?.quotes || [];
}

export function useApprovals() {
  const currentUser = useAuthStore((s) => s.user);
  const myId = currentUser?._id || currentUser?.id || null;
  const query = useQuery({
    queryKey: ["approvals", myId ? String(myId) : "guest"],
    queryFn: ({ signal }) => fetchApprovalQuotes(signal),
    staleTime: 30_000,
    enabled: !!myId,
  });
  const incoming = useMemo(
    () => flattenApprovals(query.data, myId),
    [query.data, myId]
  );
  const outgoing = useMemo(
    () => flattenSentApprovals(query.data, myId),
    [query.data, myId]
  );
  const items = useMemo(
    () => [...incoming, ...outgoing].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [incoming, outgoing]
  );
  return { ...query, items, myId };
}

export function useMyShareEntry(quoteId) {
  const { items, myId, ...rest } = useApprovals();
  const entry = useMemo(
    () => items.filter((i) => !i.outgoing).find((i) => i.quoteId && quoteId && String(i.quoteId) === String(quoteId)) || null,
    [items, quoteId]
  );
  return { ...rest, items, myId, entry };
}
