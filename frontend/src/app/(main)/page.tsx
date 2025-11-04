'use client';

import { useEffect, useState } from 'react';
import { fetchReconciliationResults, type ReconciliationResult } from '@/lib/api/reconciliation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function Home() {
  const [results, setResults] = useState<ReconciliationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchReconciliationResults();
        setResults(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Collective-Reconciliation by KC Kim</h1>
      <p className="text-lg mb-8">Page for reconciling transactions and bank balances</p>
      
      <div className="w-full max-w-4xl">
        {loading && <p>Loading...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}
        {!loading && !error && (
        //   Table with header and body
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bank Balance</TableHead>
                <TableHead>Transaction Cumulative</TableHead>
                <TableHead>Transaction Total per Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.date}>
                  <TableCell>{result.date}</TableCell>
                  <TableCell>{result.bank_balance}</TableCell>
                  <TableCell>{result.transaction_total_per_date_cumulative}</TableCell>
                  <TableCell>
                    <Tooltip>
                        {/* Adding tooltip to show list for transactions for the date. */}
                        {/* It should show the list of transactions for the date when the user hovers over the cell on Transaction Total per Date column. */}
                      <TooltipTrigger asChild>
                        <span className="cursor-auto border-b border-dotted border-border">
                          {result.transaction_total_per_date}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col gap-1">
                          <div className="font-semibold mb-1">Transactions:</div>
                          {result.transactions_per_date.map((transaction, idx) => (
                            <div key={idx}>• {transaction}</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className={`font-bold ${result.match_bool ? 'text-emerald-600' : 'text-red-600'}`}>
                    {result.match_bool ? 'Match' : 'No Match'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

