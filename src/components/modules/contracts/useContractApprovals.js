"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { contractsApi } from "@/lib/api/contracts";
import { leadsApi } from "@/lib/api/leads";
import { usersApi } from "@/lib/api/users";
import { useAuthStore } from "@/store/authStore";

function personName(person) {
  if (!person || typeof person !== "object") return "";
  const full = [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
  return full || person.name || person.username || person.email || "";
}

export function flattenContractApprovals(contracts, myId, usersById) {
  const items = [];
  for (const contract of Array.isArray(contracts) ? contracts : []) {
    const contractId = contract?._id || contract?.id;
    const lead = contract?.leadId && typeof contract.leadId === "object" ? contract.leadId : null;
    const leadId = lead?._id ? String(lead._id) : contract?.leadId ? String(contract.leadId) : null;
    for (const entry of contract?.sharedWith || []) {
      const recipientId = entry?.user?._id || entry?.user?.id || entry?.user;
      if (!myId || String(recipientId) !== String(myId)) continue;
      const sharedBy = entry?.sharedBy && typeof entry.sharedBy === "object"
        ? entry.sharedBy
        : usersById?.get(String(entry?.sharedBy)) || null;
      const senderName = personName(sharedBy);
      items.push({
        key: `contract-${entry?._id || `${contractId}-${recipientId}`}`,
        kind: "contract",
        contractId: contractId ? String(contractId) : null,
        quoteId: null,
        quoteTitle: contract?.name || "Contract",
        leadId,
        leadName: "",
        senderName,
        status: entry?.status || "Sent",
        messages: Array.isArray(entry?.messages) ? entry.messages : [],
        notes: "",
        date: entry?.updatedAt || entry?.sharedAt || contract?.updatedAt,
        approved: entry?.status === "Approved",
        rejected: entry?.status === "Rejected",
      });
    }
  }
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return items;
}

export function flattenSentContractApprovals(contracts, myId, usersById) {
  const items = [];
  for (const contract of Array.isArray(contracts) ? contracts : []) {
    const contractId = contract?._id || contract?.id;
    const lead = contract?.leadId && typeof contract.leadId === "object" ? contract.leadId : null;
    const leadId = lead?._id ? String(lead._id) : contract?.leadId ? String(contract.leadId) : null;
    for (const entry of contract?.sharedWith || []) {
      const recipientId = entry?.user?._id || entry?.user?.id || entry?.user;
      const senderId = entry?.sharedBy?._id || entry?.sharedBy?.id || entry?.sharedBy;
      if (!myId || String(senderId) !== String(myId)) continue;
      if (String(recipientId) === String(myId)) continue;
      if (entry?.status !== "Approved" && entry?.status !== "Rejected") continue;
      const recipient = entry?.user && typeof entry.user === "object"
        ? entry.user
        : usersById?.get(String(entry?.user)) || null;
      items.push({
        key: `contract-${entry?._id || `${contractId}-${recipientId}-sent`}`,
        kind: "contract",
        contractId: contractId ? String(contractId) : null,
        quoteId: null,
        quoteTitle: contract?.name || "Contract",
        leadId,
        leadName: "",
        senderName: personName(recipient),
        status: entry?.status || "Sent",
        messages: Array.isArray(entry?.messages) ? entry.messages : [],
        notes: "",
        date: entry?.updatedAt || entry?.sharedAt || contract?.updatedAt,
        approved: entry?.status === "Approved",
        rejected: entry?.status === "Rejected",
        outgoing: true,
      });
    }
  }
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return items;
}

export async function fetchSharedContracts(signal) {
  const { leads } = await leadsApi.getLeadList();
  const rows = Array.isArray(leads) ? leads : [];
  const ids = rows.map((l) => l?._id || l?.id).filter(Boolean).map(String);
  const contracts = [];
  // Bounded concurrency: never flood the API no matter the lead count.
  const POOL = 6;
  for (let i = 0; i < ids.length; i += POOL) {
    const settled = await Promise.allSettled(
      ids.slice(i, i + POOL).map((leadId) =>
        contractsApi.getContractsList(leadId, signal ? { signal } : {})
      )
    );
    for (const r of settled) {
      if (r.status !== "fulfilled") continue;
      const res = r.value;
      const list = Array.isArray(res) ? res : res?.results || res?.data || [];
      if (Array.isArray(list)) contracts.push(...list);
    }
    if (signal?.aborted) break;
  }
  return contracts;
}

export function useContractApprovals(enabled = true) {
  const currentUser = useAuthStore((s) => s.user);
  const myId = currentUser?._id || currentUser?.id || null;

  const query = useQuery({
    queryKey: ["contract-approvals", myId ? String(myId) : "guest"],
    queryFn: ({ signal }) => fetchSharedContracts(signal),
    // Heavy fan-out query: cache long, socket events force refresh.
    staleTime: 10 * 60_000,
    enabled: enabled && !!myId,
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: ({ signal }) => usersApi.getUsers({}, { signal }),
    staleTime: 30_000,
    enabled: enabled && !!myId,
  });
  const usersById = useMemo(() => {
    const map = new Map();
    const list = usersQuery.data?.users;
    if (Array.isArray(list)) {
      for (const u of list) {
        const id = u?._id || u?.id;
        if (id) map.set(String(id), u);
      }
    }
    return map;
  }, [usersQuery.data]);

  const incoming = useMemo(
    () => flattenContractApprovals(query.data, myId, usersById),
    [query.data, myId, usersById]
  );
  const outgoing = useMemo(
    () => flattenSentContractApprovals(query.data, myId, usersById),
    [query.data, myId, usersById]
  );
  const items = useMemo(
    () => [...incoming, ...outgoing].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [incoming, outgoing]
  );
  return { ...query, items, myId };
}

export function useMyContractShareEntry(contractId) {
  const { items, myId, ...rest } = useContractApprovals();
  const entry = useMemo(
    () =>
      items
        .filter((i) => !i.outgoing)
        .find((i) => i.contractId && contractId && String(i.contractId) === String(contractId)) || null,
    [items, contractId]
  );
  return { ...rest, items, myId, entry };
}
