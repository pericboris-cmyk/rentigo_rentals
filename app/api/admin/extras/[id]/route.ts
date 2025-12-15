import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const body = await request.json()

    const { data: extra, error } = await supabase
      .from("extras")
      .update({
        name: body.name,
        description: body.description,
        price_per_day: body.price_per_day,
        icon_name: body.icon_name,
        active: body.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(extra)
  } catch (error: any) {
    console.error("[v0] Error updating extra:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const { error } = await supabase.from("extras").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting extra:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
