import { NextResponse } from 'next/server';
import { fetchData } from "@/utils/data";

export async function GET() {
    return NextResponse.json({ message: await fetchData() });
}

export async function POST() {
    return NextResponse.json({ message: 'POST request to /api/' });
}

export async function PUT() {
    return NextResponse.json({ message: 'PUT request to /api/' });
}

export async function DELETE() {
    return NextResponse.json({ message: 'DELETE request to /api/' });
}